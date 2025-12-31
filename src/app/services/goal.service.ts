import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../models/goal.model';

export interface MonthlyPlan {
    month: string; // e.g., "March 2026"
    monthIndex: number; // 1-based index from start
    expenseAmount: number; // Amount needed for goals in this month
    totalExpenseSoFar: number; // Cumulative expense
    proposedSavings: number; // Calculated savings for this month
    requiredSavings: number; // The max required savings to be safe
}

@Injectable({
    providedIn: 'root'
})
export class GoalService {
    private goalsSubject = new BehaviorSubject<Goal[]>([]);
    public goals$ = this.goalsSubject.asObservable();
    private readonly STORAGE_KEY = 'financial_goals';

    private categoriesSubject = new BehaviorSubject<string[]>([]);
    public categories$ = this.categoriesSubject.asObservable();
    private readonly CATEGORIES_STORAGE_KEY = 'financial_categories';

    private globalAmountSubject = new BehaviorSubject<number>(0);
    public globalAmount$ = this.globalAmountSubject.asObservable();
    private readonly GLOBAL_AMOUNT_KEY = 'financial_global_amount';

    constructor() {
        this.loadGoals();
        this.loadCategories();
        this.loadGlobalAmount();
    }

    private loadGoals() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.goalsSubject.next(JSON.parse(saved));
        }
    }

    private loadCategories() {
        const saved = localStorage.getItem(this.CATEGORIES_STORAGE_KEY);
        if (saved) {
            this.categoriesSubject.next(JSON.parse(saved));
        }
    }

    private loadGlobalAmount() {
        const saved = localStorage.getItem(this.GLOBAL_AMOUNT_KEY);
        if (saved) {
            this.globalAmountSubject.next(JSON.parse(saved));
        }
    }

    setGlobalAmount(amount: number) {
        localStorage.setItem(this.GLOBAL_AMOUNT_KEY, JSON.stringify(amount));
        this.globalAmountSubject.next(amount);
    }

    getGlobalAmount(): number {
        return this.globalAmountSubject.value;
    }

    private saveCategories(categories: string[]) {
        localStorage.setItem(this.CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        this.categoriesSubject.next(categories);
    }

    getCategories(): string[] {
        return this.categoriesSubject.value;
    }

    private addCategory(category: string) {
        if (!category || category.trim() === '') return;

        const categories = this.getCategories();
        const trimmedCategory = category.trim();

        if (!categories.includes(trimmedCategory)) {
            categories.push(trimmedCategory);
            this.saveCategories(categories);
        }
    }

    private saveGoals(goals: Goal[]) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
        this.goalsSubject.next(goals);
    }

    getGoals(): Goal[] {
        return this.goalsSubject.value;
    }

    addGoal(goal: Goal) {
        const goals = this.getGoals();
        goals.push(goal);
        this.saveGoals(goals);

        if (goal.category) {
            this.addCategory(goal.category);
        }
    }

    updateGoal(updatedGoal: Goal) {
        const goals = this.getGoals().map(g => g.id === updatedGoal.id ? updatedGoal : g);
        this.saveGoals(goals);

        if (updatedGoal.category) {
            this.addCategory(updatedGoal.category);
        }
    }

    deleteGoal(id: string) {
        const goals = this.getGoals().filter(g => g.id !== id);
        this.saveGoals(goals);
    }

    // Calculation Logic
    calculatePlan(startMonth: Date = new Date(2026, 0, 1)): MonthlyPlan[] {
        let goals = this.getGoals();
        if (goals.length === 0) return [];

        // 1. Determine Horizon for expansion
        let maxDate = new Date(startMonth);
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        goals.forEach(g => {
            const d = new Date(g.date);
            if (d > maxDate) maxDate = d;

            if (g.isRecurring) {
                if (g.recursionEndDate) {
                    const ed = new Date(g.recursionEndDate);
                    if (ed > maxDate) maxDate = ed;
                } else {
                    const cap = new Date(startMonth);
                    cap.setFullYear(cap.getFullYear() + 5);
                    if (cap > maxDate) maxDate = cap;
                }
            }
        });

        // 2. Expand recurring goals
        const expandedGoals = this.expandRecurringGoals(goals, maxDate);

        // 3. Sort goals by date and prepare with effective amount
        // We create a new object structure to hold the calculation-specific effectiveAmount
        // so we don't mutate the original goals or re-calculate excessively.
        let sortedGoals = expandedGoals
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(g => ({
                ...g,
                // Start with net needed after individual initial amount
                calcAmount: Math.max(0, g.amount - (g.initialAmount || 0))
            }));

        if (sortedGoals.length === 0) return [];

        // 3.5 Distribute Global Accumulated Amount
        let remainingGlobal = this.getGlobalAmount();
        if (remainingGlobal > 0) {
            sortedGoals.forEach(g => {
                if (remainingGlobal <= 0) return;

                // We assume global amount is in same currency effectively, or we treat it as value
                // For correctness, we should convert global amount to goal currency OR goal amount to base.
                // Given the requirement, simple subtraction from the 'value' is implied.
                // However, simpler is to convert the goal need to base, subtract from global (base), 
                // and convert back? No, that's messy.
                // Let's assume global amount is "Base Currency" (UAH).
                // We convert the goal's calcAmount to Base to see how much it costs in Base.

                const costInBase = this.convertToBase(g.calcAmount, g.currency);

                if (costInBase > 0) {
                    const coveredInBase = Math.min(costInBase, remainingGlobal);
                    remainingGlobal -= coveredInBase;

                    // Reduce the goal's calcAmount by the proportion covered
                    // If covered 100% in base, it's 0.
                    // If covered 50%, reduce by 50%.
                    const ratio = coveredInBase / costInBase;
                    g.calcAmount = g.calcAmount * (1 - ratio);
                }
            });
        }

        // 4. Determine final horizon based on actual generated goals
        const lastGoalDate = new Date(sortedGoals[sortedGoals.length - 1].date);
        const monthsDiff = (lastGoalDate.getFullYear() - startMonth.getFullYear()) * 12 + (lastGoalDate.getMonth() - startMonth.getMonth());
        const horizon = monthsDiff + 1; // Include the target month

        // 5. Build timeline
        const timeline: MonthlyPlan[] = [];
        let cumulativeExpense = 0;

        for (let i = 1; i <= horizon; i++) {
            const currentMonthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 0); // End of month

            // Find goals in this month
            const goalsInMonth = sortedGoals.filter(g => {
                const d = new Date(g.date);
                return d.getFullYear() === currentMonthDate.getFullYear() && d.getMonth() === currentMonthDate.getMonth();
            });

            const monthlyExpense = goalsInMonth.reduce((sum, g) => {
                return sum + this.convertToBase(g.calcAmount, g.currency);
            }, 0);
            cumulativeExpense += monthlyExpense;

            timeline.push({
                month: currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
                monthIndex: i,
                expenseAmount: monthlyExpense,
                totalExpenseSoFar: cumulativeExpense,
                proposedSavings: cumulativeExpense / i,
                requiredSavings: 0 // To be calculated
            });
        }

        // 6. Calculate "Required Savings" (Max of future cumulative averages)
        for (let i = 0; i < timeline.length; i++) {
            let maxFuture = 0;
            for (let j = i; j < timeline.length; j++) {
                if (timeline[j].proposedSavings > maxFuture) {
                    maxFuture = timeline[j].proposedSavings;
                }
            }
            timeline[i].requiredSavings = maxFuture;
        }

        return timeline;
    }

    private expandRecurringGoals(goals: Goal[], horizonDate: Date): Goal[] {
        const expandedGoals: Goal[] = [];

        for (const goal of goals) {
            if (!goal.isRecurring) {
                expandedGoals.push(goal);
                continue;
            }

            const freqKey = goal.frequencyKey || 1;
            const freqType = goal.frequencyType || 'Month';

            // Start from the goal's initial date
            let currentDate = new Date(goal.date);
            const endDate = goal.recursionEndDate ? new Date(goal.recursionEndDate) : horizonDate;
            const effectiveEndDate = endDate < horizonDate ? endDate : horizonDate;

            let currentAmount = goal.amount;

            // Safety check
            let safety = 0;
            while (currentDate <= effectiveEndDate && safety < 1000) {
                expandedGoals.push({
                    ...goal,
                    amount: currentAmount, // Use calculated amount
                    date: currentDate.toISOString().split('T')[0],
                    // Create a unique virtual ID for the instance
                    id: `${goal.id}_recur_${safety}`
                });

                // Calculate next amount based on variation
                if (goal.recurrenceVariation && goal.recurrenceVariationValue) {
                    if (goal.recurrenceVariation === 'FIXED') {
                        currentAmount += goal.recurrenceVariationValue;
                    } else if (goal.recurrenceVariation === 'PERCENT') {
                        currentAmount += currentAmount * (goal.recurrenceVariationValue / 100);
                    } else if (goal.recurrenceVariation === 'PERCENT_ANNUAL') {
                        // Calculate effective rate for the period
                        let effectiveRate = 0;
                        if (freqType === 'Year') {
                            effectiveRate = goal.recurrenceVariationValue * freqKey;
                        } else {
                            // Month
                            // Annual rate * (months / 12)
                            effectiveRate = goal.recurrenceVariationValue * (freqKey / 12);
                        }
                        currentAmount += currentAmount * (effectiveRate / 100);
                    }
                }

                // Advance date
                if (freqType === 'Month') {
                    currentDate.setMonth(currentDate.getMonth() + freqKey);
                } else if (freqType === 'Year') {
                    currentDate.setFullYear(currentDate.getFullYear() + freqKey);
                }

                safety++;
            }
        }
        return expandedGoals;
    }

    private convertToBase(amount: number, currency: string): number {
        // Mock conversion
        // USD=41, EUR=44, UAH=1
        switch (currency) {
            case 'USD': return amount * 41;
            case 'EUR': return amount * 44;
            default: return amount;
        }
    }
}
