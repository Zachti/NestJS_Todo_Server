import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'dateNotInPast', async: false })
export class DateNotInPastConstraint implements ValidatorConstraintInterface {
  validate(value: number) {
    const currentDate = new Date();
    return value >= currentDate.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return `Error: Can’t create new TODO that its due date is in the past`;
  }
}

export function DateNotInPast(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DateNotInPastConstraint,
    });
  };
}
