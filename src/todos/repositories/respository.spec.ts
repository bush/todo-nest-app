import { ConsoleLogger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TodoPreview } from '../interfaces/todo';
import { TodoConfig } from './electrodb/todos-config';
import { ITodoRepository } from '../interfaces/todos-repository';
import { ElectroDbTodoRepository } from './electrodb/todos-repository.service';

import { Logger } from '@nestjs/common';

const useLogger = false;

describe('RepositoryService', () => {

  Logger.log(`NODE_ENV: ${process.env.NODE_ENV}`, 'RepositoryService');

  let repository: ITodoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `config/dynamodb/.${process.env.NODE_ENV}.env`,
        }),
      ],
      providers: [
        {
          provide: 'TodoRepositoryService',
          useClass: ElectroDbTodoRepository,
        },
        TodoConfig,
        {
          provide: DynamoDBClient,
          useFactory: (config: ConfigService) => {
            return new DynamoDBClient({ endpoint: config.get<string>('ENDPOINT') })
          },
          inject: [ConfigService],
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
