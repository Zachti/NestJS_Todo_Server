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
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get('size')
  @UsePipes(new DatabaseTypeValidationPipe())
  count(
    @Query('database') database: DatabaseType,
    @Query('status') status: State,
  ) {
    return this.todoService.count(database, status);
  }

  @Get('content')
  @UsePipes(new DatabaseTypeValidationPipe(), new SortByTypeValidator())
  getContent(
    @Query('database') database: DatabaseType,
    @Query('status') status: State,
    @Query('sortBy') sortBy: SortByTypes,
  ) {
    return this.todoService.getContent(database, status, sortBy);
  }

  @Put()
  update(
    @Query('id') id: string,
    @Query('status') state: State,
    @Query('title') title: string,
    @Query('content') content: string,
    @Query('duedate') duedate: number,
  ) {
    return this.todoService.update(+id, { state, title, content, duedate });
  }

  @Delete()
  remove(@Query('id') id: string) {
    return this.todoService.remove(+id);
  }
}
