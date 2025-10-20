import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  orders?: { id: number }[];
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<Customer[]> {
    return this.apollo
      .watchQuery<{ customers: (Customer | undefined)[] }>({
        query: gql`
          query GetCustomers {
            customers {
              id
              name
              email
              phone
              address
              orders {
                id
              }
            }
          }
        `,
      })
      .valueChanges.pipe(
        map((res) =>
          (res.data?.customers ?? []).filter((c): c is Customer => !!c)
        )
      );
  }

  create(input: CreateCustomerInput): Observable<Customer | null> {
    return this.apollo
      .mutate<{ createCustomer: Customer }>({
        mutation: gql`
          mutation CreateCustomer($input: CreateCustomerInput!) {
            createCustomer(input: $input) {
              id
              name
              email
              phone
              address
              orders {
                id
              }
            }
          }
        `,
        variables: { input },
      })
      .pipe(map((res) => res.data?.createCustomer ?? null));
  }

  update(id: number, input: UpdateCustomerInput): Observable<Customer | null> {
    return this.apollo
      .mutate<{ updateCustomer: Customer }>({
        mutation: gql`
          mutation UpdateCustomer($id: Int!, $input: UpdateCustomerInput!) {
            updateCustomer(id: $id, input: $input) {
              id
              name
              email
              phone
              address
              orders {
                id
              }
            }
          }
        `,
        variables: { id, input },
      })
      .pipe(map((res) => res.data?.updateCustomer ?? null));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteCustomer: boolean }>({
        mutation: gql`
          mutation DeleteCustomer($id: Int!) {
            deleteCustomer(id: $id)
          }
        `,
        variables: { id },
      })
      .pipe(map((res) => res.data?.deleteCustomer ?? false));
  }
}
