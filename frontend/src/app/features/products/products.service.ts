import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  id: number;
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
      .watchQuery<{ products: (Product | undefined)[] }>({
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
      })
      .valueChanges.pipe(
        map((result) =>
          (result.data?.products ?? []).filter((p): p is Product => !!p)
        )
      );
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.apollo
      .watchQuery<{ productsByCategory: (Product | undefined)[] }>({
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
      })
      .valueChanges.pipe(
        map((result) =>
          (result.data?.productsByCategory ?? []).filter(
            (p): p is Product => !!p
          )
        )
      );
  }

  createProduct(input: CreateProductInput): Observable<Product | null> {
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
      })
      .pipe(map((res) => res.data?.createProduct ?? null));
  }

  updateProduct(id: number, input: Omit<UpdateProductInput, 'id'>): Observable<Product | null> {
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
      })
      .pipe(map((res) => res.data?.updateProduct ?? null));
  }

  deleteProduct(id: number): Observable<Product | null> {
    return this.apollo
      .mutate<{ deleteProduct: Product }>({
        mutation: gql`
          mutation DeleteProduct($id: Int!) {
            deleteProduct(id: $id) {
              id
              name
              price
              description
            }
          }
        `,
        variables: { id },
      })
      .pipe(map((res) => res.data?.deleteProduct ?? null));
  }
}
