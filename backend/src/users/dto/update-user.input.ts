import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => Int)
  id!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Neplatný formát e-mailu' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(6, { message: 'Heslo musí mít alespoň 6 znaků' })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  role?: string;
}
