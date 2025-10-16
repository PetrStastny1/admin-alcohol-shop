import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products-container">
      <h2>Seznam produktů</h2>
      <ul>
        <li *ngFor="let p of products()">
          {{ p.name }} – {{ p.price }} Kč
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .products-container { max-width: 600px; margin: 40px auto; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px; border-bottom: 1px solid #ccc; }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<any[]>([]);

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo.watchQuery({
      query: gql`
        query {
          products {
            id
            name
            price
          }
        }
      `
    }).valueChanges.subscribe((res: any) => {
      this.products.set(res?.data?.products || []);
    });
  }
}
