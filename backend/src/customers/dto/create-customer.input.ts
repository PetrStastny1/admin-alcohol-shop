import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateCustomerInput {
  @Field(() => String)
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value.trim())
  name!: string;

  @Field(() => String)
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(6, 20)
  @Matches(/^[0-9+ ]+$/, { message: 'Phone může obsahovat jen čísla, mezery a +.' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  @Transform(({ value }) => value?.trim())
  address?: string;
}
