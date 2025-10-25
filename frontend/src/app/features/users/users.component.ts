import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User, CreateUserInput, UpdateUserInput } from './users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  editingUser: User | null = null;
  editingUserPassword = '';
  newUser: { email: string; username?: string; password: string; role: string } | null = null;
  loading = false;
  saving = false;
  errorMsg: string | null = null;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  goBackOneStep() {
    this.location.back();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  fetchUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Nepodařilo se načíst uživatele';
        this.loading = false;
      },
    });
  }

  startNew() {
    this.newUser = { username: '', email: '', password: '', role: 'user' };
  }

  saveNew() {
    if (!this.newUser?.username?.trim() || !this.newUser?.email?.trim() || !this.newUser?.password?.trim()) {
      this.errorMsg = 'Vyplňte všechny povinné údaje';
      return;
    }
    this.saving = true;
    const input: CreateUserInput = {
      username: this.newUser.username.trim(),
      email: this.newUser.email.trim(),
      password: this.newUser.password.trim(),
      role: this.newUser.role,
    };
    this.usersService.create(input).subscribe({
      next: (created) => {
        if (created) this.users.push(created);
        this.newUser = null;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Chyba při vytváření uživatele';
        this.saving = false;
      },
    });
  }

  cancelNew() {
    this.newUser = null;
    this.resetErrors();
  }

  startEdit(user: User) {
    this.resetErrors();
    this.editingUser = { ...user };
    this.editingUserPassword = '';
  }

  saveEdit() {
    if (!this.editingUser) return;
    const input: UpdateUserInput = {};

    if (this.editingUser.username?.trim()) input.username = this.editingUser.username.trim();
    if (this.editingUser.email?.trim()) input.email = this.editingUser.email.trim();
    if (this.editingUserPassword.trim()) input.password = this.editingUserPassword.trim();
    if (this.editingUser.role?.trim()) input.role = this.editingUser.role.trim();

    this.saving = true;
    this.usersService.update(this.editingUser.id, input).subscribe({
      next: (updated) => {
        if (updated) {
          this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
        }
        this.editingUser = null;
        this.editingUserPassword = '';
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Chyba při ukládání změn uživatele';
        this.saving = false;
      },
    });
  }

  cancelEdit() {
    this.editingUser = null;
    this.editingUserPassword = '';
    this.resetErrors();
  }

  deleteUser(id: number) {
    if (this.saving) return;
    if (!confirm('Opravdu chceš smazat tohoto uživatele?')) return;
    this.saving = true;
    this.usersService.delete(id).subscribe({
      next: (ok) => {
        if (ok) this.users = this.users.filter((u) => u.id !== id);
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Chyba při mazání uživatele';
        this.saving = false;
      },
    });
  }

  private resetErrors() {
    this.errorMsg = null;
  }
}
