import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService, Order } from './orders.service';
import { CategoriesService, Category } from '../categories/categories.service';
import { ProductsService, Product } from '../products/products.service';
import { CustomersService, Customer } from '../customers/customers.service';
import { Router, ActivatedRoute } from '@angular/router';

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
  newOrder: any | null = null;
  loading = false;
  saving = false;
  errorMsg: string | null = null;
  customerIdFilter: number | null = null;

  constructor(
    private ordersService: OrdersService,
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private customersService: CustomersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('customerId');
      this.customerIdFilter = id ? +id : null;
      this.fetchOrders();
    });

    this.fetchCategories();
    this.fetchProducts();
    this.fetchCustomers();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  fetchOrders() {
    this.loading = true;
    if (this.customerIdFilter) {
      this.ordersService.getOrdersByCustomer(this.customerIdFilter).subscribe({
        next: (data) => {
          this.orders = data ?? [];
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Nepodařilo se načíst objednávky zákazníka';
          this.loading = false;
        },
      });
    } else {
      this.ordersService.getOrders().subscribe({
        next: (data) => {
          this.orders = data ?? [];
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Nepodařilo se načíst objednávky';
          this.loading = false;
        },
      });
    }
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
    this.newOrder = {
      customer: this.customerIdFilter
        ? this.customers.find(c => c.id === this.customerIdFilter) ?? null
        : null,
      product: null,
      category: null,
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
    };
  }

  saveNew() {
    if (!this.newOrder?.customer || !this.newOrder.product) {
      this.errorMsg = 'Vyplňte zákazníka a produkt';
      return;
    }
    const input = {
      customerId: this.newOrder.customer.id,
      productId: this.newOrder.product.id,
      categoryId: this.newOrder.category?.id,
      quantity: this.newOrder.quantity ?? 1,
      date: this.newOrder.date ?? new Date().toISOString(),
    };
    this.ordersService.create(input).subscribe({
      next: (created) => {
        if (created) this.orders.push(created);
        this.newOrder = null;
      },
      error: () => (this.errorMsg = 'Chyba při vytváření objednávky'),
    });
  }

  cancelNew() {
    this.newOrder = null;
  }

  startEdit(order: Order) {
    this.editingOrder = { ...order };
  }

  saveEdit() {
    if (!this.editingOrder) return;
    const input = {
      customerId: this.editingOrder.customer.id,
      productId: this.editingOrder.product?.id,
      categoryId: this.editingOrder.category?.id,
      quantity: this.editingOrder.quantity,
      date: this.editingOrder.date,
    };
    this.ordersService.update(this.editingOrder.id, input).subscribe({
      next: (updated) => {
        if (updated) {
          this.orders = this.orders.map((o) =>
            o.id === updated.id ? updated : o
          );
        }
        this.editingOrder = null;
      },
      error: () => (this.errorMsg = 'Chyba při ukládání změn'),
    });
  }

  cancelEdit() {
    this.editingOrder = null;
  }

  deleteOrder(id: number) {
    if (!confirm('Opravdu chceš smazat tuto objednávku?')) return;
    this.ordersService.delete(id).subscribe({
      next: (ok) => {
        if (ok) this.orders = this.orders.filter((o) => o.id !== id);
      },
      error: () => (this.errorMsg = 'Chyba při mazání objednávky'),
    });
  }

  compareCategory(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareProduct(p1: any, p2: any): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  compareCustomer(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}
