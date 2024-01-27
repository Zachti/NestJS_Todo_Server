import { IsNotEmpty, IsString } from 'class-validator';
import { DateNotInPast } from '../validators/date.validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @DateNotInPast()
  duedate: number;
}
