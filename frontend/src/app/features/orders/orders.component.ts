import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService, Order } from './orders.service';
import { CategoriesService, Category } from '../categories/categories.service';
import { ProductsService, Product } from '../products/products.service';
import { CustomersService, Customer } from '../customers/customers.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  editingOrder: Order | null = null;
  newOrder: {
    customer: Customer | null;
    date: string;
    items: { category?: Category; product: Product | null; quantity: number }[];
  } | null = null;
  loading = false;
  saving = false;
  errorMsg: string | null = null;
  customerIdFilter: number | null = null;
  today = new Date().toISOString().split('T')[0];

  sortColumn: 'id' | 'customer' | 'date' | 'price' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  pageSizes = [10, 30, 50];

  constructor(
    private ordersService: OrdersService,
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private customersService: CustomersService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('customerId');
      this.customerIdFilter = id ? +id : null;
      this.fetchOrders();
    });
    this.fetchCategories();
    this.fetchProducts();
    this.fetchCustomers();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goBackOneStep() {
    this.location.back();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  fetchOrders() {
    this.loading = true;
    const request$ = this.customerIdFilter
      ? this.ordersService.getOrdersByCustomer(this.customerIdFilter)
      : this.ordersService.getOrders();

    request$.subscribe({
      next: (data) => {
        this.orders = data ?? [];
        this.loading = false;
        this.currentPage = 1;
      },
      error: () => {
        this.errorMsg = this.customerIdFilter
          ? 'Nepodařilo se načíst objednávky zákazníka'
          : 'Nepodařilo se načíst objednávky';
        this.loading = false;
      },
    });
  }

  fetchCategories() {
    this.categoriesService.getAll().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  fetchProducts() {
    this.productsService.getProducts().subscribe({
      next: (data) => (this.products = data),
    });
  }

  fetchCustomers() {
    this.customersService.getAll().subscribe({
      next: (data) => (this.customers = data),
    });
  }

  startNew() {
    if (!this.isAdmin()) return;
    this.newOrder = {
      customer: this.customerIdFilter
        ? this.customers.find((c) => c.id === this.customerIdFilter) ?? null
        : null,
      date: this.today,
      items: [{ category: undefined, product: null, quantity: 1 }],
    };
  }

  addItem() {
    this.newOrder?.items.push({ category: undefined, product: null, quantity: 1 });
  }

  removeItem(index: number) {
    this.newOrder?.items.splice(index, 1);
  }

  get totalPrice(): number {
    if (!this.newOrder) return 0;
    return this.newOrder.items.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      return sum + price * (item.quantity || 0);
    }, 0);
  }

  compareCustomer = (c1: Customer, c2: Customer): boolean =>
    c1 && c2 ? c1.id === c2.id : c1 === c2;

  compareProduct = (p1: Product, p2: Product): boolean =>
    p1 && p2 ? p1.id === p2.id : p1 === p2;

  compareCategory = (cat1: Category, cat2: Category): boolean =>
    cat1 && cat2 ? cat1.id === cat2.id : cat1 === cat2;

  saveNew() {
    if (!this.isAdmin() || !this.newOrder?.customer || this.newOrder.items.length === 0) {
      this.errorMsg = 'Vyplňte zákazníka a alespoň jeden produkt';
      return;
    }
    const items = this.newOrder.items
      .filter((i) => i.product && i.quantity > 0)
      .map((i) => ({
        productId: i.product!.id,
        quantity: i.quantity,
        categoryId: i.category?.id,
      }));
    if (items.length === 0) {
      this.errorMsg = 'Přidejte alespoň jeden validní produkt';
      return;
    }
    const input = {
      customerId: this.newOrder.customer.id,
      date: this.newOrder.date,
      items,
    };
    this.saving = true;
    this.ordersService.create(input).subscribe({
      next: () => {
        this.fetchOrders();
        this.newOrder = null;
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při vytváření objednávky';
        this.saving = false;
      },
    });
  }

  cancelNew() {
    this.newOrder = null;
  }

  startEdit(order: Order) {
    if (!this.isAdmin()) return;
    this.editingOrder = {
      ...order,
      items: order.items.map((i) => ({
        ...i,
        category: i.product.category ?? undefined,
      })),
    };
  }

  saveEdit() {
    if (!this.isAdmin() || !this.editingOrder) return;
    const items = this.editingOrder.items
      .filter((i) => i.product && i.quantity > 0)
      .map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        categoryId: i.category?.id,
      }));
    const input = {
      customerId: this.editingOrder.customer.id,
      date: this.editingOrder.date,
      items,
    };
    this.saving = true;
    this.ordersService.update(this.editingOrder.id, input).subscribe({
      next: () => {
        this.fetchOrders();
        this.editingOrder = null;
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při ukládání změn';
        this.saving = false;
      },
    });
  }

  cancelEdit() {
    this.editingOrder = null;
  }

  deleteOrder(id: number) {
    if (!this.isAdmin()) return;
    if (!confirm('Opravdu chceš smazat tuto objednávku?')) return;
    this.saving = true;
    this.ordersService.delete(id, this.customerIdFilter ?? undefined).subscribe({
      next: (ok) => {
        if (ok) this.fetchOrders();
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Chyba při mazání objednávky';
        this.saving = false;
      },
    });
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      return sum + price * (item.quantity || 0);
    }, 0);
  }

  getEditingOrderTotal(): number {
    if (!this.editingOrder) return 0;
    return this.editingOrder.items.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      return sum + price * (item.quantity || 0);
    }, 0);
  }

  getFilteredProducts(categoryId?: number) {
    if (!categoryId) return this.products;
    return this.products.filter((p) => p.category?.id === categoryId);
  }

  get sortedOrders(): Order[] {
    let sorted = [...this.orders];
    sorted.sort((a, b) => {
      let valA: any, valB: any;
      switch (this.sortColumn) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'customer':
          valA = a.customer?.name?.toLowerCase() || '';
          valB = b.customer?.name?.toLowerCase() || '';
          break;
        case 'date':
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
        case 'price':
          valA = this.getOrderTotal(a);
          valB = this.getOrderTotal(b);
          break;
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedOrders.length / this.pageSize));
  }

  get pagedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedOrders.slice(start, start + this.pageSize);
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

  changeSort(column: 'id' | 'customer' | 'date' | 'price') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  sortIcon(column: 'id' | 'customer' | 'date' | 'price'): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '⬆' : '⬇';
  }
}
