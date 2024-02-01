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
    const sortbyValues = Object.values(SortByTypes);
    if (!sortbyValues.includes(value as SortByTypes)) {
      throw new BadRequestException('Error: invalid sortBy!');
    }
    return value;
  }
}
