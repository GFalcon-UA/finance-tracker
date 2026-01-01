import { Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService, MonthlyPlan } from '../../services/goal.service';
import { RemoveCurrencyPipe } from '../../pipes/remove-currency.pipe';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, RemoveCurrencyPipe],
  template: `
    <div class="plan-container">
      <h2>Financial Plan</h2>
      <div *ngIf="plan.length > 0; else noPlan">
        <div class="summary-card">
          <h3>Monthly Savings Target</h3>
          <p class="highlight-amount">{{ currentRequiredSavings | currency:'UAH':'code':'1.2-2' | removeCurrency }} UAH</p>
          <p class="subtitle">Required for the next month to stay on track</p>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Expenses</th>
                <th *ngIf="isDevelopment">Total Expenses</th>
                <th *ngIf="isDevelopment">Proposed Savings</th>
                <th>Required Savings</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of plan">
                <td>{{ row.month }}</td>
                <td>
                  <span *ngIf="row.expenseAmount > 0" class="expense-badge">
                    {{ row.expenseAmount | currency:'UAH':'code':'1.2-2' | removeCurrency }}
                  </span>
                </td>
                <td *ngIf="isDevelopment">{{ row.totalExpenseSoFar | currency:'UAH':'code':'1.2-2' | removeCurrency }}</td>
                <td *ngIf="isDevelopment">{{ row.proposedSavings | currency:'UAH':'code':'1.2-2' | removeCurrency }}</td>
                <td class="required-col">{{ row.requiredSavings | currency:'UAH':'code':'1.2-2' | removeCurrency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ng-template #noPlan>
        <div class="empty-state">
          <p>Add goals to generate a financial plan.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .plan-container {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    h2 {
      margin-top: 0;
      color: #111827;
      margin-bottom: 1.5rem;
    }
    .summary-card {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 2rem;

      h3 { margin: 0; font-weight: 500; opacity: 0.9; }
      .highlight-amount {
        font-size: 3rem;
        font-weight: 800;
        margin: 0.5rem 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .subtitle { margin: 0; opacity: 0.8; font-size: 0.875rem; }
    }
    .table-responsive {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th {
        text-align: left;
        padding: 1rem;
        background: #f9fafb;
        color: #6b7280;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
      }
      td {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        color: #374151;
      }
      tr:last-child td { border-bottom: none; }

      .expense-badge {
        background: #fee2e2;
        color: #991b1b;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 600;
      }
      .required-col {
        font-weight: 700;
        color: #059669;
      }
    }
    .empty-state {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }
  `]
})
export class PlanComponent implements OnInit {
  plan: MonthlyPlan[] = [];
  currentRequiredSavings = 0;
  isDevelopment = isDevMode();

  constructor(private goalService: GoalService) { }

  ngOnInit() {
    this.goalService.goals$.subscribe(() => {
      this.calculate();
    });
    this.goalService.globalAmount$.subscribe(() => {
      this.calculate();
    });
  }

  calculate() {
    // Assuming calculation starts from Jan 2026 as per user example,
    // OR we should use current date?
    // User said "Suppose calculation is done in Jan 2026".
    // I will use Jan 2026 for consistency with the example, or maybe current date?
    // "The current local time is: 2025-11-20".
    // If I use current date, the example won't match exactly.
    // But for a real app, it should be current date.
    // However, to verify the user's example, I'll stick to Jan 2026 for now,
    // or better, I'll use the current date but let's see.
    // Actually, the user said "Suppose calculation is done in Jan 2026".
    // I'll use a fixed date for now to match the example, but in a real app I'd use new Date().
    // Let's use Jan 2026 to ensure the math matches the user's expectation for verification.
    // I'll add a comment about this.
    var currentDate = new Date();
    var planDate: Date;
    if (currentDate.getDate() < 29) {
      planDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } else {
      var year = currentDate.getMonth() == 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
      var month = currentDate.getMonth() == 11 ? 0 : currentDate.getMonth() + 1;
      planDate = new Date(year, month, 1);
    }
    this.plan = this.goalService.calculatePlan(planDate);
    if (this.plan.length > 0) {
      this.currentRequiredSavings = this.plan[0].requiredSavings;
    } else {
      this.currentRequiredSavings = 0;
    }
  }
}
