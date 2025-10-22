import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Order {
  id: number;
  customer: { id: number; name: string; email: string };
  quantity: number;
  date: string;
  totalPrice: number;
  product?: { id: number; name: string; price: number };
  category?: { id: number; name: string };
}

export interface CreateOrderInput {
  customerId: number;
  productId: number;
  categoryId?: number;
  quantity: number;
}

export interface UpdateOrderInput {
  productId?: number;
  categoryId?: number;
  quantity?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private apollo: Apollo) {}

  getOrders(): Observable<Order[]> {
    return this.apollo
      .watchQuery<{ orders: (Order | null)[] }>({
        query: gql`
          query GetOrders {
            orders {
              id
              customer { id name email }
              quantity
              date
              totalPrice
              product { id name price }
              category { id name }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) => (res.data?.orders ?? []).filter((o): o is Order => !!o))
      );
  }

  getOrdersByCustomer(customerId: number): Observable<Order[]> {
    return this.apollo
      .watchQuery<{ ordersByCustomer: (Order | null)[] }>({
        query: gql`
          query GetOrdersByCustomer($customerId: Int!) {
            ordersByCustomer(customerId: $customerId) {
              id
              customer { id name email }
              quantity
              date
              totalPrice
              product { id name price }
              category { id name }
            }
          }
        `,
        variables: { customerId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) => (res.data?.ordersByCustomer ?? []).filter((o): o is Order => !!o))
      );
  }

  create(input: CreateOrderInput): Observable<Order | null> {
    return this.apollo
      .mutate<{ createOrder: Order }>({
        mutation: gql`
          mutation CreateOrder($input: CreateOrderInput!) {
            createOrder(input: $input) {
              id
              customer { id name email }
              quantity
              date
              totalPrice
              product { id name price }
              category { id name }
            }
          }
        `,
        variables: { input },
        refetchQueries: [
          'GetOrders',
          {
            query: gql`
              query GetOrdersByCustomer($customerId: Int!) {
                ordersByCustomer(customerId: $customerId) {
                  id
                }
              }
            `,
            variables: { customerId: input.customerId },
          },
        ],
      })
      .pipe(map((res) => res.data?.createOrder ?? null));
  }

  update(id: number, input: UpdateOrderInput): Observable<Order | null> {
    return this.apollo
      .mutate<{ updateOrder: Order }>({
        mutation: gql`
          mutation UpdateOrder($id: Int!, $input: UpdateOrderInput!) {
            updateOrder(id: $id, input: $input) {
              id
              customer { id name email }
              quantity
              date
              totalPrice
              product { id name price }
              category { id name }
            }
          }
        `,
        variables: { id, input },
        refetchQueries: ['GetOrders'],
      })
      .pipe(map((res) => res.data?.updateOrder ?? null));
  }

  delete(id: number, customerId?: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteOrder: boolean }>({
        mutation: gql`
          mutation DeleteOrder($id: Int!) {
            deleteOrder(id: $id)
          }
        `,
        variables: { id },
        refetchQueries: [
          'GetOrders',
          ...(customerId
            ? [
                {
                  query: gql`
                    query GetOrdersByCustomer($customerId: Int!) {
                      ordersByCustomer(customerId: $customerId) {
                        id
                      }
                    }
                  `,
                  variables: { customerId },
                },
              ]
            : []),
        ],
      })
      .pipe(map((res) => res.data?.deleteOrder ?? false));
  }
}
