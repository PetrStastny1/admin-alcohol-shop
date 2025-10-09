import { IsString, validateSync, ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

function IsValidPort(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPort',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const portValue = parseInt(value, 10);
          return !isNaN(portValue) && portValue > 0 && portValue < 65536;
        },
        defaultMessage() {
          return `$property must be a valid port number (number between 1 and 65535).`;
        },
      },
    });
  };
}

class EnvironmentVariables {
  @IsString()
  DB_HOST: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsValidPort({ message: 'DB_PORT must be a valid number between 1 and 65535.' })
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;
}

export function validate(config: Record<string, unknown>) {
  console.log('Validated Environment Variables:', config);

  const validatedConfig = Object.assign(new EnvironmentVariables(), config);

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    throw new Error(
      `Validation failed: ${errors
        .map((err) =>
          err.constraints
            ? Object.values(err.constraints).join(', ')
            : 'Unknown validation error'
        )
        .join(', ')}`
    );
  }

  return validatedConfig;
}