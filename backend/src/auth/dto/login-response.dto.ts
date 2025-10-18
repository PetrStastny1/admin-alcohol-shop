import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class LoginResponseDto {
  @Field()
  access_token!: string;

  @Field(() => Int)
  id!: number;

  @Field()
  username!: string;
}
