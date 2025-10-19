import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Category } from './categories.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories$!: Observable<Category[]>;
  editingCategory: Category | null = null;
  newCategory: Partial<Category> | null = null;
  saving = false;
  errorMsg: string | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categories$ = this.categoriesService.getAll();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToProducts(categoryId: number) {
    this.router.navigate(['/products'], { queryParams: { categoryId } });
  }

  startNew() {
    this.resetErrors();
    this.newCategory = { name: '', description: '' };
  }

  saveNew() {
    if (!this.newCategory?.name?.trim()) {
      this.errorMsg = 'Name is required';
      return;
    }
    this.saving = true;
    this.categoriesService
      .create(this.newCategory.name.trim(), this.newCategory.description?.trim())
      .subscribe({
        next: () => {
          this.newCategory = null;
          this.loadCategories();
        },
        error: (err) => (this.errorMsg = this.prettyGqlError(err)),
        complete: () => (this.saving = false),
      });
  }

  cancelNew() {
    this.newCategory = null;
    this.resetErrors();
  }

  startEdit(cat: Category) {
    this.resetErrors();
    this.editingCategory = { ...cat };
  }

  saveEdit() {
    if (!this.editingCategory) return;
    const { id, name, description } = this.editingCategory;
    if (!name?.trim()) {
      this.errorMsg = 'Name is required';
      return;
    }
    this.saving = true;
    this.categoriesService.update(id, name.trim(), description?.trim()).subscribe({
      next: () => {
        this.editingCategory = null;
        this.loadCategories();
      },
      error: (err) => (this.errorMsg = this.prettyGqlError(err)),
      complete: () => (this.saving = false),
    });
  }

  cancelEdit() {
    this.editingCategory = null;
    this.resetErrors();
  }

  deleteCategory(id: number) {
    if (this.saving) return;
    if (!confirm('Opravdu chceš smazat tuto kategorii?')) return;
    this.saving = true;
    this.categoriesService.delete(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => (this.errorMsg = this.prettyGqlError(err)),
      complete: () => (this.saving = false),
    });
  }

  private prettyGqlError(err: any): string {
    return (
      err?.graphQLErrors?.[0]?.message ??
      err?.networkError?.message ??
      err?.message ??
      'Unknown error'
    );
  }

  private resetErrors() {
    this.errorMsg = null;
  }

  trackById(_i: number, c: Category) {
    return c.id;
  }
}
