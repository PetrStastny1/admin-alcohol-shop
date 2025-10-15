import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginAdminInput {
  @Field()
  username!: string;

  @Field()
  password!: string;
}
