import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  categoryId?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}
