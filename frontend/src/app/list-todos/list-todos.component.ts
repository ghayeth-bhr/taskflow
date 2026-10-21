import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { Todo } from '../model/todo';
import { TodoDataService } from '../service/data/todo-data.service';

@Component({
  selector: 'app-list-todos',
  templateUrl: './list-todos.component.html',
  styleUrls: ['./list-todos.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, DatePipe]
})
export class ListTodosComponent implements OnInit {
  todos: Todo[] = [];
  message = '';
  errorMessage = '';
  loading = false;

  constructor(private todoService: TodoDataService, private router: Router) {}

  ngOnInit(): void {
    this.refreshTodos();
  }

  refreshTodos(): void {
    this.loading = true;
    this.todoService.retrieveAllTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.detail ?? 'Unable to load the tasks';
      }
    });
  }

  toggleDone(todo: Todo): void {
    this.todoService.updateTodo(todo.id, {
      description: todo.description,
      done: !todo.done,
      targetDate: todo.targetDate
    }).subscribe({
      next: () => this.refreshTodos(),
      error: (error) => (this.errorMessage = error?.error?.detail ?? 'Unable to update the task')
    });
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.message = `Task ${id} deleted`;
        this.refreshTodos();
      },
      error: (error) => (this.errorMessage = error?.error?.detail ?? 'Unable to delete the task')
    });
  }

  updateTodo(id: number): void {
    this.router.navigate(['/todos', id]);
  }

  addTodo(): void {
    this.router.navigate(['/todos', -1]);
  }
}
