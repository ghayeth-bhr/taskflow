import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TodoRequest } from '../model/todo';
import { TodoDataService } from '../service/data/todo-data.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink]
})
export class TodoComponent implements OnInit {
  id = -1;
  description = '';
  done = false;
  targetDate = '';
  errorMessage = '';
  loading = false;

  constructor(
    private todoService: TodoDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.params['id']);

    if (this.id !== -1) {
      this.loading = true;
      this.todoService.retrieveTodo(this.id).subscribe({
        next: (todo) => {
          this.description = todo.description;
          this.done = todo.done;
          this.targetDate = todo.targetDate;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.detail ?? 'Unable to load the task';
        }
      });
    }
  }

  saveTodo(): void {
    const payload: TodoRequest = {
      description: this.description,
      done: this.done,
      targetDate: this.targetDate
    };

    const request = this.id === -1
      ? this.todoService.createTodo(payload)
      : this.todoService.updateTodo(this.id, payload);

    request.subscribe({
      next: () => this.router.navigate(['/todos']),
      error: (error) => (this.errorMessage = error?.error?.detail ?? 'Unable to save the task')
    });
  }
}
