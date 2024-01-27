import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { SortByTypes } from '../enums/enums';

@Injectable()
export class SortByTypeValidator implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) return value;
    if (!SortByTypes[value as keyof typeof SortByTypes]) {
      throw new BadRequestException(
        `Invalid sortBy parameter. Allowed values: ${Object.values(SortByTypes).join(', ')}`,
      );
    }
    return value;
  }
}
