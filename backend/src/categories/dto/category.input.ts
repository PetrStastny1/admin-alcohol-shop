import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CategoryInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}
