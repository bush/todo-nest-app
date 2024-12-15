// src/todos/repositories/repository.spec.ts
import { ConsoleLogger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ElectroDbTodoRepository } from './electrodb/todos-repository.service';
import { ITodoRepository } from '../interfaces/todos-repository';
import { TodoPreview } from '../interfaces/todo';
import todosConfig from './electrodb/todos-config';

const useLogger = false;

describe('RepositoryService', () => {
  let repository: ITodoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // What is the root directory of the configuration file?

        ConfigModule.forRoot({
          envFilePath: 'config/dynamodb/.env.dynamodb.repositories',
          load: [todosConfig],
        }),
      ],
      providers: [
        {
          provide: 'TodoRepositoryService',
          useClass: ElectroDbTodoRepository,
        },
      ],
    })
      .setLogger(useLogger ? new ConsoleLogger() : null)
      .compile();

    repository = module.get<ITodoRepository>('TodoRepositoryService');
  });

  it('should create a new todo', async () => {
    let todo = {
      title: 'Test Todo',
      description: 'Test Description',
      isCompleted: false,
    };
    const created = await repository.create(todo);
    const found = await repository.findOne(created.id);
    const createdTodo = { ...created, ...todo };
    expect(createdTodo).toEqual(found);
  });

  it('should update a todo', async () => {
    const todo = {
      title: 'Update Test Todo',
      description: 'Update Test Description',
      isCompleted: false,
    };
    const res = await repository.create(todo);
    const updatedTodo = { ...todo, isCompleted: true };
    await repository.update(res.id, updatedTodo);
    const { id, ...foundTodo } = await repository.findOne(res.id);
    expect(foundTodo).toEqual(updatedTodo);
  });

  it('should get all todos', async () => {
    let todos: TodoPreview[] = [];
    let cursor = null;
    do {
      const res = await repository.findAll(cursor);
      todos.push(...res.todos);
      cursor = res.next;
    } while (cursor !== null);
  });

  it('should delete a todo', async () => {
    const todo = {
      title: 'Delete Test Todo',
      description: 'Delete Test Description',
      isCompleted: false,
    };
    const res = await repository.create(todo);
    await repository.remove(res.id);
    const foundTodo = await repository.findOne(res.id);
    expect(foundTodo).toBeNull();
  });
});
