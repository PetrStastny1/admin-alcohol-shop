import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class LoginGQL extends Mutation<{ login: { access_token: string } }> {
  document = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        access_token
      }
    }
  `;
}
