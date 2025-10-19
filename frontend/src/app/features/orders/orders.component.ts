import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
  // Zatím statická data (mock)
  orders = [
    {
      id: 1,
      customer: 'Jan Novák',
      product: 'Rum Havana',
      quantity: 2,
      total: '800 Kč',
      createdAt: '2025-10-16',
    },
    {
      id: 2,
      customer: 'Petr Svoboda',
      product: 'Víno Rulandské',
      quantity: 1,
      total: '250 Kč',
      createdAt: '2025-10-15',
    },
  ];

  // Akce (zatím jen placeholdery)
  editOrder(id: number) {
    console.log('Upravit objednávku', id);
  }

  deleteOrder(id: number) {
    console.log('Smazat objednávku', id);
  }
}
