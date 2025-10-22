import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, MinLength, Length } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(3, 50, { message: 'Uživatelské jméno musí mít 3–50 znaků' })
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Neplatný formát e-mailu' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(6, { message: 'Heslo musí mít alespoň 6 znaků' })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  role?: string;
}
