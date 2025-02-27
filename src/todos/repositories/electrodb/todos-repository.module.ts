import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TodoConfig } from './todos-config';
import { ElectroDbTodoRepository } from './todos-repository.service';
import { TodosRepository } from '../../interfaces/todos-repository';

const TodosRepositoryProvider = { provide: TodosRepository, useClass: ElectroDbTodoRepository };

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/dynamodb/.${process.env.NODE_ENV}.env`,
    }),
  ],
  providers: [
    TodosRepositoryProvider,
    TodoConfig,
    {
      provide: DynamoDBClient,
      useFactory: (config: ConfigService) => {
        const client =
          process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'test'
            ? new DynamoDBClient({
              endpoint: config.get<string>('ENDPOINT'),
              region: config.get<string>('TODO_TABLE_REGION'),
            })
            : new DynamoDBClient({});
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [TodosRepositoryProvider],
})
export class TodosRepositoryElectorDBModule { }
