import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  password?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private apollo: Apollo) {}

  getUsers(): Observable<User[]> {
    return this.apollo
      .watchQuery<{ users: (User | null)[] }>({
        query: gql`
          query GetUsers {
            users {
              id
              email
              username
              role
              created_at
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map(res => (res.data?.users ?? []).filter((u): u is User => !!u))
      );
  }

  create(input: CreateUserInput): Observable<User | null> {
    return this.apollo
      .mutate<{ createUser: User }>({
        mutation: gql`
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              email
              username
              role
              created_at
            }
          }
        `,
        variables: { input },
        refetchQueries: ['GetUsers'],
      })
      .pipe(map(res => res.data?.createUser ?? null));
  }

  update(id: number, input: UpdateUserInput): Observable<User | null> {
    return this.apollo
      .mutate<{ updateUser: User }>({
        mutation: gql`
          mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
            updateUser(id: $id, input: $input) {
              id
              email
              username
              role
              created_at
            }
          }
        `,
        variables: { id, input },
        refetchQueries: ['GetUsers'],
      })
      .pipe(map(res => res.data?.updateUser ?? null));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteUser: boolean }>({
        mutation: gql`
          mutation DeleteUser($id: Int!) {
            deleteUser(id: $id)
          }
        `,
        variables: { id },
        refetchQueries: ['GetUsers'],
      })
      .pipe(map(res => res.data?.deleteUser ?? false));
  }
}
