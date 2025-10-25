import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService, Category } from './categories.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  editingCategory: Category | null = null;
  newCategory: Partial<Category> | null = null;
  saving = false;
  errorMsg: string | null = null;

  currentPage = 1;
  pageSize = 10;
  pageSizes = [10, 30, 50];

  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    public authService: AuthService,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = data ?? [];
        this.currentPage = 1;
      },
      error: () => {
        this.errorMsg = 'Nepodařilo se načíst kategorie';
      },
    });
  }

  get totalPages(): number {
    return Math.ceil(this.categories.length / this.pageSize) || 1;
  }

  get pagedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.categories.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goBackOneStep() {
    this.location.back();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToProducts(categoryId: number) {
    this.router.navigate(['/products'], { queryParams: { categoryId } });
  }

  startNew() {
    this.errorMsg = null;
    this.newCategory = { name: '', description: '' };
  }

  saveNew() {
    if (!this.newCategory?.name?.trim()) {
      this.errorMsg = 'Vyplňte název kategorie';
      return;
    }
    this.saving = true;
    this.categoriesService
      .create(this.newCategory.name.trim(), this.newCategory.description?.trim())
      .subscribe({
        next: (created) => {
          if (created) this.loadCategories();
          this.newCategory = null;
          this.saving = false;
        },
        error: () => {
          this.errorMsg = 'Chyba při vytváření kategorie';
          this.saving = false;
        },
      });
  }

  cancelNew() {
    this.newCategory = null;
    this.errorMsg = null;
  }

  startEdit(category: Category) {
    this.errorMsg = null;
    this.editingCategory = { ...category };
  }

  saveEdit() {
    if (!this.editingCategory?.name?.trim()) {
      this.errorMsg = 'Vyplňte název kategorie';
      return;
    }
    this.saving = true;
    this.categoriesService
      .update(
        this.editingCategory.id,
        this.editingCategory.name.trim(),
        this.editingCategory.description?.trim()
      )
      .subscribe({
        next: (updated) => {
          if (updated) this.loadCategories();
          this.editingCategory = null;
          this.saving = false;
        },
        error: () => {
          this.errorMsg = 'Chyba při editaci kategorie';
          this.saving = false;
        },
      });
  }

  cancelEdit() {
    this.editingCategory = null;
    this.errorMsg = null;
  }

  deleteCategory(id: number) {
    if (this.saving) return;
    if (!confirm('Opravdu chceš smazat tuto kategorii?')) return;
    this.saving = true;
    this.categoriesService.delete(id).subscribe({
      next: (deleted) => {
        if (deleted) this.loadCategories();
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při mazání kategorie';
        this.saving = false;
      },
    });
  }

  trackById(_i: number, c: Category) {
    return c.id;
  }
}
