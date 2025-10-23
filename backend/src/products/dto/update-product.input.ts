import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class UpdateProductInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 100, { message: 'Název musí mít 3–100 znaků' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cena může mít max 2 desetinná místa' })
  @Min(0)
  @Max(99999)
  price?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Popis může mít max 1000 znaků' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  categoryId?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Sklad musí být celé číslo' })
  @Min(0)
  stock?: number;
}
