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
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) return value;

    const disallowAll = this.options ? this.options.disallowAll : false;
    const stateValues = Object.values(State);

    if (
      (disallowAll && value === State.All) ||
      !stateValues.includes(value as State)
    ) {
      throw new BadRequestException('Error: invalid status!');
    }

    return value;
  }
}
