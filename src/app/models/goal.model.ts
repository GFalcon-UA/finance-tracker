export interface Goal {
    id: string;
    name: string;
    amount: number;
    initialAmount?: number;
    currency: string;
    date: string; // YYYY-MM-DD
    category?: string;
    // Recursion fields
    isRecurring?: boolean;
    frequencyType?: 'Month' | 'Year';
    frequencyKey?: number; // e.g. 1 for "every 1 month"
    recursionEndDate?: string; // YYYY-MM-DD
    // Variation fields
    recurrenceVariation?: 'NONE' | 'FIXED' | 'PERCENT' | 'PERCENT_ANNUAL';
    recurrenceVariationValue?: number;
}
