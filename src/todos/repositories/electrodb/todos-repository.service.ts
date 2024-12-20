import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';

import { TodoConfig, TodoEntity} from './todos-config';
import { CreateTodoDto } from '../../dto/create-todo.dto';
import { UpdateTodoDto } from '../../dto/update-todo.dto';
import { Todo, Todos, TodoID } from '../../interfaces/todo';
import { ITodoRepository } from '../../interfaces/todos-repository';

@Injectable()
export class ElectroDbTodoRepository implements ITodoRepository {
  private todos: TodoEntity

  constructor(config: TodoConfig) {
    this.todos = config.entity;
  }

  async create(createTodoDto: CreateTodoDto): Promise<TodoID> {
    const { title, description, isCompleted } = createTodoDto;
    const id = uuidv4();
    const complete = isCompleted || false;

    const result = await this.todos
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
    const result = await this.todos.query.primary({}).go({
      cursor: next,
      attributes: ['id', 'title', 'isCompleted'],
      count: 10,
    });

    return { next: result.cursor, todos: result.data } as Todos;
  }

  async findOne(id: string): Promise<Todo> {
    const result = await this.todos.get({ id }).go();
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
    const result = await this.todos
      .patch({ id })
      .set({ title, description, isCompleted })
      .go();
  }

  async remove(id: string): Promise<void> {
    await this.todos.delete({ id }).go();
  }  
}
