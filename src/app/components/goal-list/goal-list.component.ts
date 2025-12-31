import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Goal } from '../../models/goal.model';
import { GoalService } from '../../services/goal.service';
import { RemoveCurrencyPipe } from '../../pipes/remove-currency.pipe';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoveCurrencyPipe],
  template: `
    <div class="goal-list-container">
      <div class="global-amount-section">
        <label for="globalAmount">Total Savings / Deposit (Base Currency)</label>
        <input 
          id="globalAmount" 
          type="number" 
          [(ngModel)]="globalAmount" 
          (ngModelChange)="onGlobalAmountChange()"
          placeholder="0.00"
          class="global-input">
        <p class="hint">This amount will be distributed to cover your goals, starting with the earliest.</p>
      </div>

      <h2>Your Goals</h2>
      <div class="goals-grid">
        <div *ngFor="let goal of goals$ | async" class="goal-card">
          <div class="goal-header">
            <h3>{{ goal.name }}</h3>
            <span class="category-badge">{{ goal.category }}</span>
          </div>
          <div class="goal-details">
            <p class="amount">
              {{ goal.amount | currency:goal.currency:'code':'1.2-2' | removeCurrency }} {{ goal.currency }}
              <span *ngIf="goal.isRecurring" title="Recurring Goal" class="recurrence-icon">↻</span>
            </p>
             <p *ngIf="goal.initialAmount" class="initial-amount">
                (Accumulated: {{ goal.initialAmount | currency:goal.currency:'code':'1.2-2' | removeCurrency }})
             </p>
            <p class="date">Target: {{ goal.date | date:'mediumDate' }}</p>
            <p *ngIf="goal.isRecurring" class="recurrence-info">
              Repeats every {{ goal.frequencyKey }} {{ goal.frequencyType }}(s)
              <span *ngIf="goal.recurrenceVariation !== 'NONE'">
                (Variation: {{ goal.recurrenceVariation }})
              </span>
              <br>
              <span *ngIf="goal.recursionEndDate" class="end-date">Ends: {{ goal.recursionEndDate | date:'mediumDate' }}</span>
            </p>
          </div>
          <div class="goal-actions">
            <button (click)="onEdit(goal)" class="btn-edit">Edit</button>
            <button (click)="onDelete(goal.id)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
      <div *ngIf="(goals$ | async)?.length === 0" class="empty-state">
        <p>No goals yet. Add one to get started!</p>
      </div>
    </div>
  `,
  styles: [`
    .goal-list-container {
      padding: 1rem;
    }
    .global-amount-section {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      
      label {
        display: block;
        font-weight: 600;
        color: #166534;
        margin-bottom: 0.5rem;
      }
      
      .global-input {
        width: 100%;
        max-width: 300px;
        padding: 0.75rem;
        border: 1px solid #86efac;
        border-radius: 8px;
        font-size: 1.1rem;
        color: #14532d;
        
        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.4);
        }
      }
      
      .hint {
        margin: 0.5rem 0 0;
        font-size: 0.875rem;
        color: #15803d;
      }
    }
    .goals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .goal-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid rgba(0,0,0,0.05);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
      }
    }
    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
      
      h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
      }
    }
    .category-badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    .goal-details {
      margin-bottom: 1.5rem;
      
      .amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: #059669;
        margin: 0;
      }
      .initial-amount {
        font-size: 0.875rem;
        color: #6b7280;
        margin-top: -0.25rem;
        margin-bottom: 0.5rem;
      }
      .date {
        color: #6b7280;
        font-size: 0.875rem;
        margin: 0.25rem 0 0;
      }
      .recurrence-info {
        color: #4f46e5;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        background: #eef2ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        display: inline-block;
      }
      .recurrence-icon {
        font-size: 1.25rem;
        margin-left: 0.5rem;
        color: #4f46e5;
        vertical-align: middle;
      }
    }
    .goal-actions {
      display: flex;
      gap: 0.5rem;
      
      button {
        flex: 1;
        padding: 0.5rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
        
        &.btn-edit {
          background: #f3f4f6;
          color: #374151;
          &:hover { background: #e5e7eb; }
        }
        &.btn-delete {
          background: #fee2e2;
          color: #dc2626;
          &:hover { background: #fecaca; }
        }
      }
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
      background: #f9fafb;
      border-radius: 12px;
      border: 2px dashed #e5e7eb;
    }
  `]
})
export class GoalListComponent {
  goals$: Observable<Goal[]>;
  globalAmount: number = 0;
  @Output() edit = new EventEmitter<Goal>();

  constructor(private goalService: GoalService) {
    // Sort goals by target date (earliest first)
    this.goals$ = this.goalService.goals$.pipe(
      map(goals => [...goals].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ))
    );
    this.globalAmount = this.goalService.getGlobalAmount();
  }

  onGlobalAmountChange() {
    this.goalService.setGlobalAmount(this.globalAmount);
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id);
    }
  }

  onEdit(goal: Goal) {
    this.edit.emit(goal);
  }
}
