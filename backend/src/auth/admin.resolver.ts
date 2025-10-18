import { Resolver, Query, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';
import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
class MeAdminResponse {
  @Field(() => Int)
  id!: number;

  @Field()
  username!: string;
}

@Resolver()
export class AdminResolver {
  @Query(() => MeAdminResponse, { name: 'meAdmin' })
  @UseGuards(GqlAuthGuard)
  async meAdmin(@Context() ctx: any): Promise<MeAdminResponse> {
    const payload = ctx.req.user;
    if (!payload || payload.username !== 'admin') {
      throw new UnauthorizedException('Neautorizovaný přístup');
    }

    return {
      id: payload.sub,
      username: payload.username,
    };
  }
}
