import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface OrderProduct {
  id: number;
  name: string;
  price: number;
  category?: { id: number; name: string };
}

export interface OrderItem {
  id: number;
  product: OrderProduct | null;
  category?: { id: number; name: string };
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer: { id: number; name: string; email: string };
  date: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerId: number;
  items: { productId: number; categoryId?: number; quantity: number }[];
  date?: string;
}

export interface UpdateOrderInput {
  customerId?: number;
  items?: { productId: number; categoryId?: number; quantity: number }[];
  date?: string;
}

const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      customer { id name email }
      date
      items {
        id
        quantity
        price
        product { id name price category { id name } }
        category { id name }
      }
    }
  }
`;

const GET_ORDERS_BY_CUSTOMER = gql`
  query GetOrdersByCustomer($customerId: Int!) {
    ordersByCustomer(customerId: $customerId) {
      id
      customer { id name email }
      date
      items {
        id
        quantity
        price
        product { id name price category { id name } }
        category { id name }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private apollo: Apollo) {}

  getOrders(): Observable<Order[]> {
    return this.apollo
      .watchQuery<{ orders: (Order | null)[] }>({
        query: GET_ORDERS,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) => (res.data?.orders ?? []).filter((o): o is Order => !!o))
      );
  }

  getOrdersByCustomer(customerId: number): Observable<Order[]> {
    return this.apollo
      .watchQuery<{ ordersByCustomer: (Order | null)[] }>({
        query: GET_ORDERS_BY_CUSTOMER,
        variables: { customerId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) =>
          (res.data?.ordersByCustomer ?? []).filter((o): o is Order => !!o)
        )
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
              date
              items {
                id
                quantity
                price
                product { id name price category { id name } }
                category { id name }
              }
            }
          }
        `,
        variables: { input },
        refetchQueries: [
          { query: GET_ORDERS },
          { query: GET_ORDERS_BY_CUSTOMER, variables: { customerId: input.customerId } },
        ],
        awaitRefetchQueries: true,
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
              date
              items {
                id
                quantity
                price
                product { id name price category { id name } }
                category { id name }
              }
            }
          }
        `,
        variables: { id, input },
        refetchQueries: [{ query: GET_ORDERS }],
        awaitRefetchQueries: true,
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
          { query: GET_ORDERS },
          ...(customerId
            ? [{ query: GET_ORDERS_BY_CUSTOMER, variables: { customerId } }]
            : []),
        ],
        awaitRefetchQueries: true,
      })
      .pipe(map((res) => res.data?.deleteOrder ?? false));
  }
}
