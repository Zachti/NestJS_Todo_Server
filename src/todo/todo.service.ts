import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Todos } from './entities/todo.entity';
import { DatabaseType, SortByTypes, State } from './enums/enums';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todos)
    private todosRepository: Repository<Todos>,
    private readonly postgresConnection: DataSource,
    private readonly mongoConnection: DataSource,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    await this.checkIfTodoExist({ title: createTodoDto.title });
    try {
      this.postgresConnection.getRepository(Todos).create(createTodoDto);
      const res = await this.mongoConnection
        .getRepository(Todos)
        .save(createTodoDto);
      return res.rawid;
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not connect to at least one DB.',
      );
    }
  }

  count(database: DatabaseType, state: State) {
    try {
      this.todosRepository = this.getDbConnection(database);
      return state == State.All
        ? this.todosRepository.count()
        : this.todosRepository.count({ where: { state } });
    } catch (e) {
      throw new InternalServerErrorException('Could not connect to the DB.');
    }
  }

  async getContent(database: DatabaseType, state: State, sortBy: SortByTypes) {
    try {
      this.todosRepository = this.getDbConnection(database);
      const res =
        state == State.All
          ? await this.todosRepository.find()
          : await this.todosRepository.find({ where: { state } });
      return sortBy
        ? res.sort((a, b) => {
            switch (sortBy.toUpperCase()) {
              case SortByTypes.Id:
                return a.rawid - b.rawid;
              case SortByTypes.DueDate:
                return a.dueDate - b.dueDate;
              case SortByTypes.Title:
                return a.title.localeCompare(b.title);
            }
          })
        : res.sort((a, b) => a.rawid - b.rawid).map((todo) => todo.content);
    } catch (e) {
      throw new InternalServerErrorException('Could not connect to the DB.');
    }
  }

  async update(rawid: number, updateTodoDto: UpdateTodoDto) {
    const { postgresTodo } = await this.checkIfTodoExist({ rawid });
    try {
      await this.postgresConnection
        .getRepository(Todos)
        .update(rawid, updateTodoDto);
      await this.mongoConnection
        .getRepository(Todos)
        .update(rawid, updateTodoDto);
      return postgresTodo.state;
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not connect to at least one DB.',
      );
    }
  }

  async remove(rawid: number) {
    const { postgresTodo, mongoTodo } = await this.checkIfTodoExist({ rawid });
    try {
      await this.postgresConnection.getRepository(Todos).remove(postgresTodo);
      await this.mongoConnection.getRepository(Todos).remove(mongoTodo);
      return this.mongoConnection.getRepository(Todos).count();
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not connect to at least one DB.',
      );
    }
  }

  private getDbConnection(database: DatabaseType) {
    switch (database) {
      case DatabaseType.Postgres:
        return this.postgresConnection.getRepository(Todos);

      case DatabaseType.Mongo:
        return this.mongoConnection.getRepository(Todos);
    }
  }

  private async checkIfTodoExist(input: { title?: string; rawid?: number }) {
    const { title, rawid } = input;

    const postgresTodo = title
      ? await this.postgresConnection.getRepository(Todos).findOneBy({ title })
      : await this.postgresConnection.getRepository(Todos).findOneBy({ rawid });

    const mongoTodo = title
      ? await this.mongoConnection.getRepository(Todos).findOneBy({ title })
      : await this.mongoConnection.getRepository(Todos).findOneBy({ rawid });

    if (title) {
      if (postgresTodo || mongoTodo)
        throw new ConflictException(
          `Error: TODO with the title [${title}] already exists in the DB`,
        );
    }
    if (!(postgresTodo && mongoTodo))
      throw new NotFoundException(`Error: no such TODO with id ${rawid}`);

    return {
      postgresTodo,
      mongoTodo,
    };
  }
}
