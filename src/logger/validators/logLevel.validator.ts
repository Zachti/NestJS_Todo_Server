import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { LogLevel } from '../enums/enums';

@Injectable()
export class LogLevelValidationPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    this.validateLogLevel(value);
    return value.toLowerCase();
  }

  private validateLogLevel(level: string) {
    if (!(level.toLowerCase() in LogLevel)) {
      throw new BadRequestException(`Logger level '${level}' is not allowed`);
    }
  }
}