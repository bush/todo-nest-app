import { Entity, Schema, Attribute } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Todo, Todos, TodoID, TodoPreview } from '../../interfaces/todo';
import { CreateTodoDto } from '../../dto/create-todo.dto';
import { UpdateTodoDto } from '../../dto/update-todo.dto';
import { ITodoRepository } from '../../interfaces/todos-repository';

import * as util from 'util';
import { table } from 'console';


const client = new DynamoDBClient({});


type TodoSchema = Schema<string, string, string>;
type TodoEntity = Entity<string, string, string, TodoSchema>;


@Injectable()
export class ElectroDbTodoRepository implements ITodoRepository {
  
  private todo: TodoEntity;

  constructor(private configService: ConfigService) {
    // FIXME: This logs doesn't show up for the unit test
    Logger.log(
      `${this.configService.get<string>('TODO_TABLE_TABLENAME')}`,
      'ElectroDbTodoRepository',
    );
    Logger.log('here!!!!!!', 'ElectroDbTodoRepository')

    const table = this.configService.get<string>('TODO_TABLE_TABLENAME');
    const schema = this.configService.get<TodoSchema>('schema');
    console.log(util.inspect(schema,{depth:10}))
    this.todo = new Entity(schema, { table, client });
  }

  async create(createTodoDto: CreateTodoDto): Promise<TodoID> {
    const { title, description, isCompleted } = createTodoDto;
    const id = uuidv4();
    const complete = isCompleted || false;

    const result = await this.todo
      .put({
        id,
        title: title || 'untitled',
        description: description || '',
        isCompleted: complete,
      })
      .go();

    return { id: result.data.id } as TodoID;
  }

  async findAll(next?: string): Promise<Todos> {
    const result = await this.todo.query.primary({}).go({
      cursor: next,
      attributes: ['id', 'title', 'isCompleted'],
      count: 10,
    });

    return { next: result.cursor, todos: result.data } as Todos;
  }

  async findOne(id: string): Promise<Todo> {
    const result = await this.todo.get({ id }).go();
    if (!result.data) {
      return null;
    }

    if (!result.data) {
      return null;
    }
    return result.data as Todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<void> {
    const { title, description, isCompleted } = updateTodoDto;
    const result = await this.todo
      .patch({ id })
      .set({ title, description, isCompleted })
      .go();
  }

  async remove(id: string): Promise<void> {
    await this.todo.delete({ id }).go();
  }
}
