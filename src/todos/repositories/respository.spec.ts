import { Test, TestingModule } from "@nestjs/testing";
import { ConsoleLogger, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TodoConfig } from "./electrodb/todos-config";
import { TodoPreview } from "../interfaces/todo";
import { TodosRepository } from "../interfaces/todos-repository";
import { TodosRepositoryElectorDBModule } from "./electrodb/todos-repository.module";

import util from "util";

// Logging on/off
const useLogger = false;

let repository: TodosRepository;
let testModule: TestingModule;

const electrodbTestModule = Test.createTestingModule({
  imports: [TodosRepositoryElectorDBModule],
})
  .setLogger(useLogger ? new ConsoleLogger() : null)
  .compile();

const fixtures = [
  {
    mapper: "electrodb",
    module: electrodbTestModule,

    all: (testModule: TestingModule) => {
      const config = testModule.get<ConfigService>(ConfigService);
      const todoConfig = testModule.get<TodoConfig>(TodoConfig);
      todoConfig.entity.setTableName(config.get("TODO_TABLE_TABLENAME"));
    },

    each: (testModule: TestingModule) => {
      const config = testModule.get<ConfigService>(ConfigService);
      const todoConfig = testModule.get<TodoConfig>(TodoConfig);
      todoConfig.entity.setTableName(config.get("TODO_TABLE_TABLENAME"));
    },

    getAll: (testModule: TestingModule) => {
      const todoConfig = testModule.get<TodoConfig>(TodoConfig);
      todoConfig.entity.setTableName("todo-table-empty-1");
    },
  },
];

// Currently we only support electrodb for dynamodb but could support others in
// the future. The idea is to test to the repository interface.
describe.each(fixtures)("RepositoryService", (fixture) => {
  beforeAll(async () => {
    Logger.log(`NODE_ENV: ${process.env.NODE_ENV}`, "RepositoryService");
    const testModule = await fixture.module;

    if ("all" in fixture) {
      fixture.all(testModule);
    }

    repository = testModule.get<TodosRepository>(TodosRepository);
  });

  beforeEach(async () => {
    const testModule = await fixture.module;
    fixture.each(testModule);

    Logger.log(
      `NODE_ENV: ${process.env.NODE_ENV}, mapper: ${fixture.mapper}`,
      "RepositoryService"
    );
  });

  it("NOOP", async () => {
    Logger.log("NOOP");
  });

  it("should create a new todo", async () => {
    let todo = {
      title: "Test Todo",
      description: "Test Description",
      isCompleted: false,
    };
    const created = await repository.create(todo);
    const found = await repository.findOne(created.id);
    const createdTodo = { ...created, ...todo };
    expect(createdTodo).toEqual(found);
  });

  it("should update a todo", async () => {
    const todo = {
      title: "Update Test Todo",
      description: "Update Test Description",
      isCompleted: false,
    };
    const res = await repository.create(todo);
    const updatedTodo = { ...todo, isCompleted: true };
    await repository.update(res.id, updatedTodo);
    const { id, ...foundTodo } = await repository.findOne(res.id);
    expect(foundTodo).toEqual(updatedTodo);
  });

  it("should get all todos", async () => {
    const testModule = await fixture.module;

    // Test specific setup
    fixture.getAll(testModule);

    for (const index of Array(20).keys()) {
      await repository.create({
        title: `Test Todo ${index}`,
        description: `Test Description ${index}`,
        isCompleted: false,
      });
    }

    let todos: TodoPreview[] = [];
    let next = null;
    let pages = 1;
    do {
      const res = await repository.findAll(next);
      Logger.log(`Todos: ${util.inspect(res,{depth:10})}`, "RepositoryService");
      todos.push(...res.todos);
      Logger.log(`Page ${pages}`, "RepositoryService");
      pages++;
      next = res.next;
    } while (next !== null);

    Logger.log(`Found ${todos.length} todos`, "RepositoryService");
    expect(todos.length).toBe(20);
  });

  it("should delete a todo", async () => {
    const todo = {
      title: "Delete Test Todo",
      description: "Delete Test Description",
      isCompleted: false,
    };
    const res = await repository.create(todo);
    await repository.remove(res.id);
    const foundTodo = await repository.findOne(res.id);
    expect(foundTodo).toBeNull();
  });
});
