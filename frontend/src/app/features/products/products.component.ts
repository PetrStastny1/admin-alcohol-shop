import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from './products.service';
import { CategoriesService, Category } from '../categories/categories.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  editingProduct: Product | null = null;
  newProduct: Partial<Product> | null = null;
  loading = false;
  saving = false;
  errorMsg: string | null = null;
  categoryId: number | null = null;

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.categoryId = params['categoryId'] ? +params['categoryId'] : null;
      this.fetchProducts();
      this.fetchCategories();
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  fetchProducts(): void {
    this.loading = true;
    const request$ = this.categoryId
      ? this.productsService.getProductsByCategory(this.categoryId)
      : this.productsService.getProducts();

    request$.subscribe({
      next: (data) => {
        this.products = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Nepodařilo se načíst produkty';
        this.loading = false;
      },
    });
  }

  fetchCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.errorMsg = 'Nepodařilo se načíst kategorie'),
    });
  }

  startNew() {
    if (!this.isAdmin()) return;
    this.resetErrors();
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: undefined,
    };
  }

  saveNew() {
    if (!this.isAdmin() || !this.newProduct) return;
    if (!this.newProduct.name?.trim() || this.newProduct.price == null) {
      this.errorMsg = 'Vyplňte název a cenu';
      return;
    }
    if (this.newProduct.stock == null || this.newProduct.stock < 0) {
      this.errorMsg = 'Sklad nesmí být záporný';
      return;
    }
    this.saving = true;
    const input = {
      name: this.newProduct.name.trim(),
      description: this.newProduct.description?.trim() ?? '',
      price: this.newProduct.price,
      stock: this.newProduct.stock,
      categoryId: this.newProduct.category?.id ?? this.categoryId ?? undefined,
    };
    this.productsService.create(input).subscribe({
      next: (created) => {
        if (created) {
          this.products.push(created);
        }
        this.newProduct = null;
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při vytváření produktu';
        this.saving = false;
      },
    });
  }

  cancelNew() {
    this.newProduct = null;
    this.resetErrors();
  }

  startEdit(prod: Product) {
    if (!this.isAdmin()) return;
    this.resetErrors();
    this.editingProduct = { ...prod };
  }

  saveEdit() {
    if (!this.isAdmin() || !this.editingProduct) return;
    if (!this.editingProduct.name?.trim() || this.editingProduct.price == null) {
      this.errorMsg = 'Vyplňte název a cenu';
      return;
    }
    if (this.editingProduct.stock == null || this.editingProduct.stock < 0) {
      this.errorMsg = 'Sklad nesmí být záporný';
      return;
    }
    this.saving = true;
    const input = {
      name: this.editingProduct.name.trim(),
      description: this.editingProduct.description?.trim() ?? '',
      price: this.editingProduct.price,
      stock: this.editingProduct.stock,
      categoryId: this.editingProduct.category?.id ?? this.categoryId ?? undefined,
    };
    this.productsService.update(this.editingProduct.id, input).subscribe({
      next: (updated) => {
        if (updated) {
          this.products = this.products.map((p) =>
            p.id === updated.id ? updated : p
          );
        }
        this.editingProduct = null;
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při ukládání změn';
        this.saving = false;
      },
    });
  }

  cancelEdit() {
    this.editingProduct = null;
    this.resetErrors();
  }

  deleteProduct(id: number) {
    if (!this.isAdmin() || this.saving) return;
    if (!confirm('Opravdu chceš smazat tento produkt?')) return;
    this.saving = true;
    this.productsService.delete(id, this.categoryId ?? undefined).subscribe({
      next: (deleted) => {
        if (deleted) {
          this.products = this.products.filter((p) => p.id !== id);
        }
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při mazání produktu';
        this.saving = false;
      },
    });
  }

  private resetErrors() {
    this.errorMsg = null;
  }
}
