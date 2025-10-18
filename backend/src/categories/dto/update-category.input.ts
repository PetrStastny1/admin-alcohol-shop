import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, Length, IsInt } from 'class-validator';

@InputType()
export class UpdateCategoryInput {
  @Field(() => Int)
  @IsInt()
  id!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Název musí mít alespoň 2 znaky a max. 50 znaků' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
