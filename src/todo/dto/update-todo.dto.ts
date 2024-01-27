import { PartialType } from '@nestjs/mapped-types';
import { Todos } from '../entities/todo.entity';

export class UpdateTodoDto extends PartialType(Todos) {}
