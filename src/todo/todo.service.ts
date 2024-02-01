import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todos } from './entities/todo.entity';
import { DatabaseType, SortByTypes, State } from './enums/enums';
import { LoggerService } from '../logger/logger.service';
import { MongoTodo } from './entities/mongoTodo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(MongoTodo, 'mongodb')
    private mongoRepository: Repository<MongoTodo>,
    @InjectRepository(Todos, 'postgres')
    private postgresRepository: Repository<Todos>,
    private readonly logger: LoggerService,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    await this.checkIfTodoExist({ title: createTodoDto.title }, true);
    try {
      const maxRawid = await this.postgresRepository
        .createQueryBuilder('todos')
        .select('MAX(todos.rawid)', 'max')
        .getRawOne();

      const newTodo = this.postgresRepository.create({
        ...createTodoDto,
        duedate: createTodoDto.dueDate,
        state: State.Pending,
        rawid: maxRawid.max + 1,
      });

      const res = await this.postgresRepository.save(newTodo);
      const mongoTodo = this.mongoRepository.create(res);
      await this.mongoRepository.save(mongoTodo);

      this.logger.info(`new todo created in the DBs. id: ${res.rawid}`);
      this.logger.info(`res: ${JSON.stringify(res)}`);
      return res.rawid;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async count(database: DatabaseType, state: State) {
    try {
      const repository = this.getDbConnection(database);

      const res =
        state === State.All
          ? await repository.count()
          : (await repository.find({ where: { state } })).length;

      this.logger.info(
        `The sum of todo with state: ${state} in ${database} DB is: ${res}`,
      );
      return res;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async getContent(database: DatabaseType, state: State, sortBy: SortByTypes) {
    try {
      const repository = this.getDbConnection(database);
      let res =
        state == State.All
          ? await repository.find()
          : await repository.find({ where: { state } });

      if (database === 'MONGO') {
        res = res.map((item: MongoTodo) => {
          delete item._id;
          return item;
        });
      }

      const outputTodo = res.map((item) => {
        const { rawid, ...rest } = item;
        return { id: rawid, ...rest };
      });

      const outputTodoList = sortBy
        ? outputTodo.sort((a, b) => {
            switch (sortBy.toUpperCase()) {
              case SortByTypes.Id:
                return a.id - b.id;
              case SortByTypes.DueDate:
                return a.duedate - b.duedate;
              case SortByTypes.Title:
                return a.title.localeCompare(b.title);
            }
          })
        : outputTodo.sort((a, b) => a.id - b.id);

      this.logger.info(
        `Todo list fetched from ${database} DB in state: ${state} sorted by: ${sortBy}`,
      );
      return outputTodoList;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async update(rawid: number, updateTodoDto: UpdateTodoDto) {
    const { postgresTodo } = await this.checkIfTodoExist({ rawid });
    try {
      await this.postgresRepository.update(rawid, updateTodoDto);
      await this.mongoRepository.update({ rawid }, updateTodoDto);
      this.logger.info(
        `Todo with id: ${rawid} updated to status: ${updateTodoDto.state}`,
      );
      return postgresTodo.state;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async remove(rawid: number) {
    const { postgresTodo, mongoTodo } = await this.checkIfTodoExist({ rawid });
    try {
      await this.postgresRepository.remove(postgresTodo);
      await this.mongoRepository.remove(mongoTodo);
      const count = await this.mongoRepository.count();
      this.logger.info(
        `The number of todos in the DBs after Todo with id: ${rawid} deleted is: ${count}`,
      );
      return count;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  private getDbConnection(database: DatabaseType): Repository<Todos> {
    return database === 'MONGO'
      ? this.mongoRepository
      : this.postgresRepository;
  }

  private async checkIfTodoExist(
    input: { title?: string; rawid?: number },
    create: boolean = false,
  ) {
    const { title, rawid } = input;

    const postgresTodo = title
      ? await this.postgresRepository.findOneBy({ title })
      : await this.postgresRepository.findOneBy({ rawid });

    const mongoTodo = title
      ? await this.mongoRepository.findOneBy({ title })
      : await this.mongoRepository.findOneBy({ rawid });

    if (title) {
      if (postgresTodo || mongoTodo) {
        this.logger.error(
          `Error: TODO with the title [${title}] already exists in the DB`,
        );
        throw new ConflictException(
          `Error: TODO with the title [${title}] already exists in the DB`,
        );
      }
    }
    if (!(postgresTodo && mongoTodo)) {
      if (create) return;
      this.logger.error(`Error: no such TODO with id ${rawid}`);
      throw new NotFoundException(`Error: no such TODO with id ${rawid}`);
    }

    return {
      postgresTodo,
      mongoTodo,
    };
  }

  private logAndThrowInternalServerException(e: any) {
    this.logger.error('Could not connect to at least one DB.');
    throw new InternalServerErrorException(
      'Could not connect to at least one DB.',
      e,
    );
  }
}
