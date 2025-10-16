import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
];
