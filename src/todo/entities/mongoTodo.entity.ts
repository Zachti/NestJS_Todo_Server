import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { State } from '../enums/enums';

@Entity('todos')
export class MongoTodo {
  @ObjectIdColumn()
  _id: ObjectId;

  @PrimaryColumn()
  rawid: number;

  @Column({})
  content: string;

  @Column({ type: 'bigint' })
  duedate: number;

  @Column({ default: State.Pending })
  state: State;

  @Column()
  title: string;
}
