import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.loading = true;
    this.error = null;

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Chyba při načítání uživatelů', err);
        this.error = 'Nepodařilo se načíst uživatele';
        this.loading = false;
      },
    });
  }

  deleteUser(id: number): void {
    this.usersService.deleteUser(id).subscribe({
      next: (success) => {
        if (success) {
          this.users = this.users.filter((u) => u.id !== id);
        }
      },
      error: (err) => {
        console.error('Chyba při mazání uživatele', err);
      }
    });
  }
}
