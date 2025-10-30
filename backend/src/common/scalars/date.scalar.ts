import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('FormattedDate')
export class FormattedDateScalar implements CustomScalar<string, Date> {
  description = 'Date scalar in format dd.mm.yyyy';

  parseValue(value: unknown): Date {
    return new Date(value as string);
  }

  serialize(value: unknown): string {
    const d = value instanceof Date ? value : new Date(value as string);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('FormattedDateScalar can only parse string values');
  }
}
