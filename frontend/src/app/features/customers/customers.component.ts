import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CustomersService,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './customers.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  customers$!: Observable<Customer[]>;
  editingCustomer: Customer | null = null;
  newCustomer: CreateCustomerInput | null = null;
  saving = false;
  errorMsg: string | null = null;

  constructor(
    private customersService: CustomersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customers$ = this.customersService.getAll();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToOrders(customerId: number) {
    this.router.navigate(['/orders'], { queryParams: { customerId } });
  }

  startNew() {
    this.resetErrors();
    this.newCustomer = { name: '', email: '', phone: '', address: '' };
  }

  saveNew() {
    if (!this.newCustomer?.name?.trim() || !this.newCustomer.email?.trim()) {
      this.errorMsg = 'Vyplňte jméno a email';
      return;
    }
    this.saving = true;
    const input: CreateCustomerInput = {
      name: this.newCustomer.name.trim(),
      email: this.newCustomer.email.trim(),
      phone: this.newCustomer.phone?.trim(),
      address: this.newCustomer.address?.trim(),
    };
    this.customersService.create(input).subscribe({
      next: (created) => {
        if (created) this.loadCustomers();
        this.newCustomer = null;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = 'Chyba při vytváření zákazníka';
        console.error(err);
        this.saving = false;
      },
    });
  }

  cancelNew() {
    this.newCustomer = null;
    this.resetErrors();
  }

  startEdit(customer: Customer) {
    this.resetErrors();
    this.editingCustomer = { ...customer };
  }

  saveEdit() {
    if (!this.editingCustomer) return;
    if (
      !this.editingCustomer.name?.trim() ||
      !this.editingCustomer.email?.trim()
    ) {
      this.errorMsg = 'Vyplňte jméno a email';
      return;
    }
    this.saving = true;
    const input: UpdateCustomerInput = {
      name: this.editingCustomer.name.trim(),
      email: this.editingCustomer.email.trim(),
      phone: this.editingCustomer.phone?.trim(),
      address: this.editingCustomer.address?.trim(),
    };
    this.customersService.update(this.editingCustomer.id, input).subscribe({
      next: (updated) => {
        if (updated) this.loadCustomers();
        this.editingCustomer = null;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = 'Chyba při editaci zákazníka';
        console.error(err);
        this.saving = false;
      },
    });
  }

  cancelEdit() {
    this.editingCustomer = null;
    this.resetErrors();
  }

  deleteCustomer(id: number) {
    if (this.saving) return;
    if (!confirm('Opravdu chceš smazat tohoto zákazníka?')) return;

    this.saving = true;
    this.customersService.delete(id).subscribe({
      next: (ok) => {
        if (ok) this.loadCustomers();
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = 'Chyba při mazání zákazníka';
        console.error(err);
        this.saving = false;
      },
    });
  }

  private resetErrors() {
    this.errorMsg = null;
  }

  trackById(_i: number, c: Customer) {
    return c.id;
  }
}
