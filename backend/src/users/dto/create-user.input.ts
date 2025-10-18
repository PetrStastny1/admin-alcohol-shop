import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, Length, IsOptional } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @Length(3, 50, { message: 'Uživatelské jméno musí mít 3–50 znaků' })
  username!: string;

  @Field()
  @IsEmail({}, { message: 'Neplatný formát e-mailu' })
  email!: string;

  @Field()
  @MinLength(6, { message: 'Heslo musí mít alespoň 6 znaků' })
  password!: string;

  @Field({ defaultValue: 'user', nullable: true })
  @IsOptional()
  role?: string;
}
