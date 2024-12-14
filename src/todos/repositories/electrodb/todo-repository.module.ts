import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElectroDbTodoRepository } from './todos-repository.service'
import todosConfig from './todos-config';

const todoRepoService = {
  provide: 'TodoRepositoryService',
  useClass: ElectroDbTodoRepository
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'config/dynamodb/.env.dynamodb.repositories',
      load: [todosConfig]
    }),
  ],
  providers: [{
    provide: 'TodoRepositoryService',
    useClass: ElectroDbTodoRepository
  }],
  exports: [todoRepoService],
})
export class TodosRepositoryElectorDBModule {}