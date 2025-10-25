import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemInput } from './order-item.input';

@InputType()
export class UpdateOrderInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @Field(() => [OrderItemInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items?: OrderItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;
}
