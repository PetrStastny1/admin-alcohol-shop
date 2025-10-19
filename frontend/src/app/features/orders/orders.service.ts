import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, map } from 'rxjs';

export interface Order {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  total: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private apollo: Apollo) {}

  // ✅ Získání všech objednávek
  getOrders(): Observable<Order[]> {
    return this.apollo
      .watchQuery<{ orders: Order[] }>({
        query: gql`
          query GetOrders {
            orders {
              id
              customerId
              productId
              quantity
              total
              createdAt
            }
          }
        `,
      })
      .valueChanges.pipe(map((result) => result.data?.orders as Order[] ?? []));
  }

  // ✅ Vytvoření objednávky
  createOrder(order: Partial<Order>): Observable<Order | null> {
    return this.apollo
      .mutate<{ createOrder: Order }>({
        mutation: gql`
          mutation CreateOrder($input: CreateOrderInput!) {
            createOrder(input: $input) {
              id
              customerId
              productId
              quantity
              total
              createdAt
            }
          }
        `,
        variables: { input: order },
      })
      .pipe(map((res) => (res.data?.createOrder as Order) ?? null));
  }

  // ✅ Smazání objednávky
  deleteOrder(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteOrder: boolean }>({
        mutation: gql`
          mutation DeleteOrder($id: Int!) {
            deleteOrder(id: $id)
          }
        `,
        variables: { id },
      })
      .pipe(map((res) => res.data?.deleteOrder ?? false));
  }
}
