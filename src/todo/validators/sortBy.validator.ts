import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { SortByTypes } from '../enums/enums';

@Injectable()
export class SortByTypeValidator implements PipeTransform<string> {
  transform(value: any, metadata: ArgumentMetadata): string {
    if (!value) return value;
    if (!Object.values(SortByTypes).includes(value)) {
      throw new BadRequestException('Error: invalid sortBy!');
    }
    return value;
  }
}
