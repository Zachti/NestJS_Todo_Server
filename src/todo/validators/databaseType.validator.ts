import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { DatabaseType } from '../enums/enums';

@Injectable()
export class DatabaseTypeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (!Object.values(DatabaseType).includes(value)) {
      throw new BadRequestException('Error: invalid DB!');
    }
    return value;
  }
}
