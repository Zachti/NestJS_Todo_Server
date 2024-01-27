import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { State } from '../enums/enums';

@Injectable()
export class StateValidationPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) return value;

    if (!(value in State)) {
      throw new BadRequestException('Error: invalid status!');
    }

    return value;
  }
}
