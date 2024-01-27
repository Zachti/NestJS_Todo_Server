import { ConflictException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'dateNotInPast', async: false })
export class DateNotInPastConstraint implements ValidatorConstraintInterface {
  validate(value: number) {
    const currentDate = new Date();
    if (value < currentDate.getTime()) {
      throw new ConflictException(
        `Error: Can't create new TODO with a due date in the past`,
      );
    }
    return true;
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
