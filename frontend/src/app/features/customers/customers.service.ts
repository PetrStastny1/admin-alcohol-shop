import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  constructor(private apollo: Apollo) {}

  // ✅ Načti všechny zákazníky
  getAll(): Observable<Customer[]> {
    return this.apollo
      .watchQuery<{ customers: Customer[] }>({
        query: gql`
          query GetCustomers {
            customers {
              id
              name
              email
            }
          }
        `,
      })
      .valueChanges.pipe(
        map((res) => (res.data?.customers ?? []) as Customer[])
      );
  }

  // ✅ Načti zákazníka podle ID
  getById(id: number): Observable<Customer | null> {
    return this.apollo
      .watchQuery<{ customer: Customer }>({
        query: gql`
          query GetCustomer($id: Int!) {
            customer(id: $id) {
              id
              name
              email
            }
          }
        `,
        variables: { id },
      })
      .valueChanges.pipe(
        map((res) => (res.data?.customer as Customer) ?? null)
      );
  }

  // ✅ Vytvoř zákazníka
  create(name: string, email: string): Observable<Customer | null> {
    return this.apollo
      .mutate<{ createCustomer: Customer }>({
        mutation: gql`
          mutation CreateCustomer($name: String!, $email: String!) {
            createCustomer(name: $name, email: $email) {
              id
              name
              email
            }
          }
        `,
        variables: { name, email },
      })
      .pipe(map((res) => (res.data?.createCustomer as Customer) ?? null));
  }

  // ✅ Aktualizuj zákazníka
  update(id: number, name: string, email: string): Observable<Customer | null> {
    return this.apollo
      .mutate<{ updateCustomer: Customer }>({
        mutation: gql`
          mutation UpdateCustomer($id: Int!, $name: String!, $email: String!) {
            updateCustomer(id: $id, name: $name, email: $email) {
              id
              name
              email
            }
          }
        `,
        variables: { id, name, email },
      })
      .pipe(map((res) => (res.data?.updateCustomer as Customer) ?? null));
  }

  // ✅ Smaž zákazníka
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
