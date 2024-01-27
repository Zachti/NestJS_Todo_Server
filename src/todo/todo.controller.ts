import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { DatabaseType, SortByTypes, State } from './enums/enums';
import { DatabaseTypeValidationPipe } from './validators/databaseType.validator';
import { SortByTypeValidator } from './validators/sortBy.validator';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('health')
  health() {
    return 'OK';
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto) {
    const id = await this.todoService.create(createTodoDto);
    return { result: id };
  }

  @Get('size')
  @UsePipes(new DatabaseTypeValidationPipe())
  async count(
    @Query('database') database: DatabaseType,
    @Query('status') status: State,
  ) {
    const count = await this.todoService.count(database, status);
    return { result: count };
  }

  @Get('content')
  @UsePipes(new DatabaseTypeValidationPipe(), new SortByTypeValidator())
  async getContent(
    @Query('database') database: DatabaseType,
    @Query('status') status: State,
    @Query('sortBy') sortBy: SortByTypes,
  ) {
    const todoList = await this.todoService.getContent(
      database,
      status,
      sortBy,
    );
    return { result: todoList };
  }

  @Put()
  async update(@Query('id') id: string, @Query('status') state: State) {
    const oldStatus = await this.todoService.update(+id, { state });
    return { result: oldStatus };
  }

  @Delete()
  async remove(@Query('id') id: string) {
    const count = await this.todoService.remove(+id);
    return { result: count };
  }
}
