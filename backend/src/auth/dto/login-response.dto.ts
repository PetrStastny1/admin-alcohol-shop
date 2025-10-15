import { ObjectType, Field } from '@nestjs/graphql';
import { AdminDto } from './admin.dto';

@ObjectType()
export class LoginResponseDto {
  @Field()
  access_token!: string;

  @Field(() => AdminDto)
  admin!: AdminDto;
}
