import { Injectable, Inject } from '@nestjs/common';
import { ITodoRepository } from './interfaces/todos-repository';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @Inject('TodoRepositoryService')
    private readonly todoRepository: ITodoRepository,
  ) {}

  create(createTodoDto: CreateTodoDto) {
    return this.todoRepository.create(createTodoDto);
  }

  findAll(next?: string) {
    return this.todoRepository.findAll(next);
  }

  findOne(id: string) {
    return this.todoRepository.findOne(id);
  }

  update(id: string, updateTodoDto: UpdateTodoDto) {
    return this.todoRepository.update(id, updateTodoDto);
  }

  remove(id: string) {
    return this.todoRepository.remove(id);
  }
}