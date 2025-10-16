import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: Category;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private apollo: Apollo) {}

  // 🔹 Načtení všech produktů
  getProducts(): Observable<Product[]> {
    return this.apollo
      .watchQuery<{ products?: Partial<Product>[] }>({
        query: gql`
          query {
            products {
              id
              name
              price
              category {
                id
                name
              }
            }
          }
        `,
      })
      .valueChanges.pipe(
        map((res) => (res.data?.products ?? []).map((p) => p as Product))
      );
  }

  // 🔹 Detail produktu
  getProduct(id: string): Observable<Product> {
    return this.apollo
      .watchQuery<{ product?: Partial<Product> }>({
        query: gql`
          query ($id: ID!) {
            product(id: $id) {
              id
              name
              description
              price
              category {
                id
                name
              }
            }
          }
        `,
        variables: { id },
      })
      .valueChanges.pipe(map((res) => res.data?.product as Product));
  }

  // 🔹 Přidání / editace produktu
  saveProduct(product: Partial<Product>) {
    const mutation = gql`
      mutation ($input: ProductInput!) {
        saveProduct(input: $input) {
          id
          name
          price
        }
      }
    `;
    return this.apollo.mutate({
      mutation,
      variables: { input: product },
    });
  }

  // 🔹 Smazání produktu
  deleteProduct(id: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation ($id: ID!) {
          deleteProduct(id: $id)
        }
      `,
      variables: { id },
    });
  }
}
