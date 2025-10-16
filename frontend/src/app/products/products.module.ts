import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

@NgModule({
  imports: [
    CommonModule,
    ProductListComponent,
    ProductDetailComponent,
    ProductFormComponent
  ],
  exports: [
    ProductListComponent,
    ProductDetailComponent,
    ProductFormComponent
  ]
})
export class ProductsModule {}
