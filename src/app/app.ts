import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalListComponent } from './components/goal-list/goal-list.component';
import { GoalFormComponent } from './components/goal-form/goal-form.component';
import { PlanComponent } from './components/plan/plan.component';
import { Goal } from './models/goal.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GoalListComponent, GoalFormComponent, PlanComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  showForm = false;
  goalToEdit: Goal | null = null;

  openAddForm() {
    this.goalToEdit = null;
    this.showForm = true;
  }

  openEditForm(goal: Goal) {
    this.goalToEdit = goal;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.goalToEdit = null;
  }
}
