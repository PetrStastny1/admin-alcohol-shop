import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class UpdateOrderInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  productId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  date?: string;
}
