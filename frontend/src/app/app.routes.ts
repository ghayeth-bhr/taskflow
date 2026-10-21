import { Routes } from '@angular/router';

import { ErrorComponent } from './error/error.component';
import { ListTodosComponent } from './list-todos/list-todos.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { TodoComponent } from './todo/todo.component';
import { authGuard } from './service/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'todos', component: ListTodosComponent, canMatch: [authGuard] },
  { path: 'todos/:id', component: TodoComponent, canMatch: [authGuard] },
  { path: 'logout', component: LogoutComponent },
  { path: '**', component: ErrorComponent }
];
