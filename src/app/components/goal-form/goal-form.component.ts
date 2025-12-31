import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Goal } from '../../models/goal.model';
import { GoalService } from '../../services/goal.service';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ isEditing ? 'Edit Goal' : 'Add New Goal' }}</h2>
      <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Goal Name</label>
          <input id="name" type="text" formControlName="name" placeholder="e.g., Vacation to Italy">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="amount">Amount</label>
            <input id="amount" type="number" formControlName="amount" placeholder="0.00">
          </div>
          <div class="form-group">
            <label for="currency">Currency</label>
            <select id="currency" formControlName="currency">
              <option value="UAH">UAH</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>



        <div class="form-row">
            <div class="form-group">
                <label for="initialAmount">Accumulated Amount (Optional)</label>
                <div class="amount-group">
                    <input id="initialAmount" type="number" formControlName="initialAmount" placeholder="0.00">
                    <span class="currency-suffix">{{ goalForm.get('currency')?.value }}</span>
                </div>
            </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Target Date</label>
            <input id="date" type="date" formControlName="date">
          </div>
          <div class="form-group autocomplete-wrapper">
            <label for="category">Category (optional)</label>
            <input
              id="category"
              type="text"
              formControlName="category"
              placeholder="e.g., Travel"
              (input)="onCategoryInput()"
              (focus)="onCategoryInput()"
              (blur)="hideSuggestions()">
            <ul class="autocomplete-suggestions" *ngIf="showSuggestions && filteredCategories.length > 0">
              <li
                *ngFor="let cat of filteredCategories"
                (mousedown)="selectCategory(cat)"
                class="suggestion-item">
                {{ cat }}
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group checkbox-wrapper">
          <input id="isRecurring" type="checkbox" formControlName="isRecurring">
          <label for="isRecurring">Recurring Goal</label>
        </div>



        <div class="form-row" *ngIf="goalForm.get('isRecurring')?.value">
          <div class="form-group">
            <label>Payment Schedule</label>
            <select formControlName="recurrenceVariation">
              <option value="NONE">Constant Amount</option>
              <option value="FIXED">Increase by Fixed Amount</option>
              <option value="PERCENT">Increase by Percent</option>
              <option value="PERCENT_ANNUAL">Increase by Annual Percent</option>
            </select>
          </div>
          <div class="form-group" *ngIf="goalForm.get('recurrenceVariation')?.value !== 'NONE'">
            <label>
              {{ goalForm.get('recurrenceVariation')?.value === 'FIXED' ? 'Increase Amount' : 'Percentage' }}
            </label>
            <input type="number" formControlName="recurrenceVariationValue" placeholder="0">
          </div>
        </div>

        <div class="form-row" *ngIf="goalForm.get('isRecurring')?.value">
          <div class="form-group">
            <label>Frequency</label>
            <div class="frequency-group">
                <span class="prefix">Every</span>
                <input type="number" formControlName="frequencyKey" min="1" class="freq-input">
                <select formControlName="frequencyType" class="freq-select">
                  <option value="Month">Month(s)</option>
                  <option value="Year">Year(s)</option>
                </select>
            </div>
          </div>
          <div class="form-group">
            <label for="recursionEndDate">End Date (Optional)</label>
            <input id="recursionEndDate" type="date" formControlName="recursionEndDate">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" (click)="onCancel()" class="btn-cancel">Cancel</button>
          <button type="submit" [disabled]="goalForm.invalid" class="btn-submit">
            {{ isEditing ? 'Update Goal' : 'Add Goal' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 500px;
      margin: 0 auto;
    }
    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #111827;
    }
    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.5rem;
      }
      input, select {
        width: 100%;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
      }
    }
    .autocomplete-wrapper {
      position: relative;
    }
    .autocomplete-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      margin-top: 4px;
      max-height: 200px;
      overflow-y: auto;
      list-style: none;
      padding: 0;
      margin: 4px 0 0 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 1000;
    }
    .suggestion-item {
      padding: 0.75rem;
      cursor: pointer;
      transition: background-color 0.15s;

      &:hover {
        background-color: #f3f4f6;
      }

      &:not(:last-child) {
        border-bottom: 1px solid #e5e7eb;
      }
    }
    .form-row {
      display: flex;
      gap: 1rem;
      .form-group { flex: 1; }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;

      button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        border: none;

        &.btn-cancel {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
          &:hover { background: #f9fafb; }
        }
        &.btn-submit {
          background: #4f46e5;
          color: white;
          &:hover { background: #4338ca; }
          &:disabled {
            background: #a5b4fc;
            cursor: not-allowed;
          }
        }
      }
    }
    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;

      input[type="checkbox"] {
        width: auto;
        margin: 0;
      }
      label {
        margin: 0;
        font-weight: 500;
        color: #374151;
      }
    }
    .frequency-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      .prefix {
          color: #6b7280;
          font-size: 0.875rem;
      }

      .freq-input {
          width: 60px;
          min-width: 60px;
      }

      .freq-select {
          flex: 1;
      }
    }
    .amount-group {
        position: relative;
        display: flex;
        align-items: center;

        input {
            padding-right: 3.5rem; /* Make space for suffix */
        }

        .currency-suffix {
            position: absolute;
            right: 1rem;
            color: #6b7280;
            font-weight: 500;
            pointer-events: none;
        }
    }
  `]
})
export class GoalFormComponent implements OnChanges {
  @Input() goalToEdit: Goal | null = null;
  @Output() close = new EventEmitter<void>();

  goalForm: FormGroup;
  isEditing = false;
  categories: string[] = [];
  filteredCategories: string[] = [];
  showSuggestions = false;

  constructor(private fb: FormBuilder, private goalService: GoalService) {
    this.goalForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      initialAmount: [null, [Validators.min(0)]],
      currency: ['UAH', Validators.required],
      date: ['', Validators.required],
      category: [''],
      isRecurring: [false],
      frequencyType: ['Month'],
      frequencyKey: [1, [Validators.min(1)]],
      recursionEndDate: [''],
      recurrenceVariation: ['NONE'],
      recurrenceVariationValue: [null]
    });

    // Set default values when Recurring Goal is enabled
    this.goalForm.get('isRecurring')?.valueChanges.subscribe((isRecurring: boolean) => {
      if (isRecurring) {
        // Set Payment Schedule to "Constant Amount" (NONE)
        this.goalForm.patchValue({
          recurrenceVariation: 'NONE',
          frequencyType: 'Year',
          frequencyKey: 1
        }, { emitEvent: false });
      }
    });

    this.goalService.categories$.subscribe((categories: string[]) => {
      this.categories = categories;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['goalToEdit'] && this.goalToEdit) {
      this.isEditing = true;
      this.goalForm.patchValue(this.goalToEdit);
    } else {
      this.isEditing = false;
      this.goalForm.reset({ currency: 'UAH' });
    }
  }

  onSubmit() {
    if (this.goalForm.valid) {
      const formValue = this.goalForm.value;
      if (this.isEditing) {
        this.goalService.updateGoal(formValue);
      } else {
        const newGoal: Goal = {
          ...formValue,
          id: this.generateId()
        };
        this.goalService.addGoal(newGoal);
      }
      this.close.emit();
      this.goalForm.reset({ currency: 'UAH' });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  onCancel() {
    this.close.emit();
  }

  onCategoryInput() {
    const value = this.goalForm.get('category')?.value || '';

    if (value.trim() === '') {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(cat =>
        cat.toLowerCase().includes(value.toLowerCase())
      );
    }

    this.showSuggestions = true;
  }

  selectCategory(category: string) {
    this.goalForm.patchValue({ category });
    this.showSuggestions = false;
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}
