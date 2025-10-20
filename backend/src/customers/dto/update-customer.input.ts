import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, Length, IsInt } from 'class-validator';

@InputType()
export class UpdateCustomerInput {
  @Field(() => Int)
  @IsInt()
  id!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Jméno musí mít alespoň 2 znaky a max. 100 znaků' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Neplatný formát e-mailu' })
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(6, 20, { message: 'Telefon musí mít 6–20 znaků' })
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'Adresa musí mít alespoň 5 znaků a max. 200 znaků' })
  address?: string;
}
