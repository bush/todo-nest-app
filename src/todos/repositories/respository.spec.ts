// src/todos/repositories/repository.spec.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ElectroDbTodoRepository } from './electrodb/todos-repository.service';
import { ITodoRepository } from '../interfaces/todos-repository';
import { TodoPreview } from '../interfaces/todo';

describe('RepositoryService', () => {
  let repository: ITodoRepository;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'config/.env.dynamodb.repositories'
        }),
      ],
      providers: [
        {
          provide: 'TodoRepositoryService',
          useClass: ElectroDbTodoRepository
        }
      ],
    }).compile();

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
      const res = await repository.findAll(cursor)
      todos.push(...res.todos);
      cursor = res.next
    } while ( cursor !== null)
    
    console.log(todos);
  })

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
