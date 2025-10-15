import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AdminDto {
  @Field()
  id!: number;

  @Field()
  username!: string;
}
