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
<<<<<<< HEAD
    const DBValues = Object.values(DatabaseType);
    if (!DBValues.includes(value)) {
=======
    if (!Object.values(DatabaseType).includes(value)) {
>>>>>>> be6f21f2e7c2ea30c94baf008c90c8877a989d67
      throw new BadRequestException('Error: invalid DB!');
    }
    return value;
  }
}
