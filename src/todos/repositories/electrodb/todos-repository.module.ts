import { Module } from "@nestjs/common";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { TodoConfig } from "./todos-config";
import { ElectroDbTodoRepository } from "./todos-repository.service";
import { TodosRepository } from "src/todos/interfaces/todos-repository";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/dynamodb/.${process.env.NODE_ENV}.env`,
    }),
  ],
  providers: [
    { provide: TodosRepository, useClass: ElectroDbTodoRepository },
    TodoConfig,
    {
      provide: DynamoDBClient,
      useFactory: (config: ConfigService) => {
        const client =
          process.env.NODE_ENV === "development"
            ? new DynamoDBClient({ endpoint: config.get<string>("ENDPOINT") })
            : new DynamoDBClient({});
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    {
      provide: TodosRepository,
      useClass: ElectroDbTodoRepository,
    },
  ],
})
export class TodosRepositoryElectorDBModule {}
