import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';

interface User {
  id: number;
  username: string;
  role: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class LoginGQL extends Mutation<{ login: LoginResponse }> {
  document = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        access_token
        user {
          id
          username
          role
        }
      }
    }
  `;
}
