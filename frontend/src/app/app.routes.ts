import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'categories',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/products/products.component').then(
        (m) => m.ProductsComponent
      ),
  },
  {
    path: 'customers',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/customers/customers.component').then(
        (m) => m.CustomersComponent
      ),
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/orders/orders.component').then(
        (m) => m.OrdersComponent
      ),
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/users/users.component').then(
        (m) => m.UsersComponent
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
