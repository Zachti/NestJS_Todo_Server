import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { State } from '../enums/enums';

interface StateValidationOptions {
  disallowAll?: boolean;
}
@Injectable()
export class StateValidationPipe implements PipeTransform<string> {
  constructor(private readonly options?: StateValidationOptions) {}
  transform(value: any, metadata: ArgumentMetadata): string {
    if (!value) return value;

    const disallowAll = this.options?.disallowAll;

    if (
      (disallowAll && value === State.All) ||
      !Object.values(State).includes(value)
    ) {
      throw new BadRequestException('Error: invalid status!');
    }

    return value;
  }
}
