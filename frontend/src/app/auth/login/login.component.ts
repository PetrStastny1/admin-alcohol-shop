import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = 'admin';
  password: string = '';
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.username, this.password).subscribe({
      next: (token) => {
        if (token) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error.set('Neplatné přihlašovací údaje');
        }
      },
      error: () => {
        this.error.set('Chyba při přihlášení');
      },
    });
  }
}
