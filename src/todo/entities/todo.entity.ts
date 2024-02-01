import { State } from '../enums/enums';
import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity('todos')
export class Todos {
  @PrimaryGeneratedColumn()
  rawid: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ type: 'bigint' })
  duedate: number;

  @Column({ default: State.Pending })
  state: State;
}
