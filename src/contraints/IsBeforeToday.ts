import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isBeforeToday', async: false })
export class IsBeforeTodayConstraint implements ValidatorConstraintInterface {
  validate(date: Date) {
    const today = new Date();
    return date < today;
  }
}

export function IsBeforeToday(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeToday',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsBeforeTodayConstraint,
    });
  };
}
