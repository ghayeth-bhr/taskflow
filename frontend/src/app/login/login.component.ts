import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [NgIf, FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  invalidLogin = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin(): void {
    this.loading = true;
    this.invalidLogin = false;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/todos']);
      },
      error: (error) => {
        this.loading = false;
        this.invalidLogin = true;
        // The backend answers with RFC 7807 problem details
        this.errorMessage = error?.error?.detail ?? 'Invalid credentials';
      }
    });
  }
}
