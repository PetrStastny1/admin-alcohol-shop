import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private apollo: Apollo) {}

  // ✅ Načti všechny kategorie
  getAll(): Observable<Category[]> {
    return this.apollo
      .watchQuery<{ categories: Category[] }>({
        query: GET_CATEGORIES,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) => (res.data?.categories ?? []) as Category[])
      );
  }

  // ✅ Detail kategorie podle ID
  getById(id: number): Observable<Category | null> {
    return this.apollo
      .watchQuery<{ category?: Category }>({
        query: gql`
          query GetCategory($id: Int!) {
            category(id: $id) {
              id
              name
              description
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) => (res.data?.category as Category) ?? null)
      );
  }

  // ✅ Vytvoř kategorii
  create(name: string, description?: string): Observable<Category | null> {
    return this.apollo
      .mutate<{ createCategory: Category }>({
        mutation: gql`
          mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
              name
              description
            }
          }
        `,
        variables: { input: { name, description } },
        refetchQueries: [{ query: GET_CATEGORIES }],
        awaitRefetchQueries: true,
      })
      .pipe(map((res) => res.data?.createCategory ?? null));
  }

  // ✅ Aktualizuj kategorii
  update(id: number, name: string, description?: string): Observable<Category | null> {
    return this.apollo
      .mutate<{ updateCategory: Category }>({
        mutation: gql`
          mutation UpdateCategory($input: UpdateCategoryInput!) {
            updateCategory(input: $input) {
              id
              name
              description
            }
          }
        `,
        variables: {
          input: { id, name, description },
        },
        refetchQueries: [{ query: GET_CATEGORIES }],
        awaitRefetchQueries: true,
      })
      .pipe(map((res) => res.data?.updateCategory ?? null));
  }

  // ✅ Smaž kategorii
  delete(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteCategory: boolean }>({
        mutation: gql`
          mutation DeleteCategory($id: Int!) {
            deleteCategory(id: $id)
          }
        `,
        variables: { id },
        refetchQueries: [{ query: GET_CATEGORIES }],
        awaitRefetchQueries: true,
      })
      .pipe(map((res) => res.data?.deleteCategory ?? false));
  }
}
