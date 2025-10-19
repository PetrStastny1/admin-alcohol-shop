import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private apollo: Apollo) {}

  getUsers(): Observable<User[]> {
    return this.apollo
      .watchQuery<{ users: (User | undefined)[] }>({
        query: gql`
          query GetUsers {
            users {
              id
              username
              email
              createdAt
            }
          }
        `,
      })
      .valueChanges.pipe(
        map((result) =>
          (result.data?.users ?? []).filter((u): u is User => u !== undefined)
        )
      );
  }

  deleteUser(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteUser: boolean }>({
        mutation: gql`
          mutation DeleteUser($id: Int!) {
            deleteUser(id: $id)
          }
        `,
        variables: { id },
      })
      .pipe(map((res) => res.data?.deleteUser ?? false));
  }
}
