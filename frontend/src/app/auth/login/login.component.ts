import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMsg: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMsg = 'Zadejte uživatelské jméno a heslo';
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        if (user) {
          console.log('✅ Přihlášení OK:', user);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMsg = '❌ Neplatné přihlašovací údaje';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Chyba při loginu:', err);
        this.errorMsg = 'Chyba serveru nebo neplatné údaje';
      },
    });
  }
}
