import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../products.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productsService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Chyba při načítání produktů:', err);
        this.error = 'Nepodařilo se načíst produkty.';
        this.loading = false;
      },
    });
  }

  onEdit(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  onDelete(product: Product): void {
    if (confirm(`Opravdu chceš smazat produkt "${product.name}"?`)) {
      this.productsService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (err: any) => {
          console.error(err);
          alert('Nepodařilo se smazat produkt.');
        },
      });
    }
  }

  onAdd(): void {
    this.router.navigate(['/products/new']);
  }
}
