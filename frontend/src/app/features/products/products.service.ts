import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: { id: number; name: string };
}

export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
  categoryId?: number;
}

export interface UpdateProductInput {
  name: string;
  price: number;
  description?: string;
  categoryId?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private apollo: Apollo) {}

  getProducts(): Observable<Product[]> {
    return this.apollo
      .watchQuery<{ products: (Product | null | undefined)[] }>({
        query: gql`
          query GetProducts {
            products {
              id
              name
              price
              description
              category {
                id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) =>
          (res.data?.products ?? []).filter((p): p is Product => !!p)
        )
      );
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.apollo
      .watchQuery<{ productsByCategory: (Product | null | undefined)[] }>({
        query: gql`
          query GetProductsByCategory($categoryId: Int!) {
            productsByCategory(categoryId: $categoryId) {
              id
              name
              price
              description
              category {
                id
                name
              }
            }
          }
        `,
        variables: { categoryId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) =>
          (res.data?.productsByCategory ?? []).filter((p): p is Product => !!p)
        )
      );
  }

  create(input: CreateProductInput): Observable<Product | null> {
    return this.apollo
      .mutate<{ createProduct: Product }>({
        mutation: gql`
          mutation CreateProduct($input: CreateProductInput!) {
            createProduct(input: $input) {
              id
              name
              price
              description
              category {
                id
                name
              }
            }
          }
        `,
        variables: { input },
        refetchQueries: ['GetProducts'],
      })
      .pipe(map((res) => res.data?.createProduct ?? null));
  }

  update(id: number, input: UpdateProductInput): Observable<Product | null> {
    return this.apollo
      .mutate<{ updateProduct: Product }>({
        mutation: gql`
          mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
            updateProduct(id: $id, input: $input) {
              id
              name
              price
              description
              category {
                id
                name
              }
            }
          }
        `,
        variables: { id, input },
        refetchQueries: ['GetProducts'],
      })
      .pipe(map((res) => res.data?.updateProduct ?? null));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteProduct: boolean }>({
        mutation: gql`
          mutation DeleteProduct($id: Int!) {
            deleteProduct(id: $id)
          }
        `,
        variables: { id },
        refetchQueries: ['GetProducts'],
      })
      .pipe(map((res) => res.data?.deleteProduct ?? false));
  }
}