import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ValidationPipe, ConsoleLogger } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let id: string;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .setLogger(new ConsoleLogger())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    server = app.getHttpServer();
    const res = await request(server)
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' });

    jwt = res.body.access_token;
    console.log(jwt)
  });

  it('App: greeting', () => {
    return request(server).get('/').expect(200).expect('Hello World!');
  });

  it('TODO-CREATE', async () => {
    const todo = {
      title: 'Test Todo',
      description: 'Test Description',
      isCompleted: false,
    };

    const res = await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${jwt}`)
      .send(todo)
      .expect(201);
    console.log('status!!!!!');
    console.log(res.statusCode);
    console.log(res.body);
    const { id } = res.body;
    expect(id).toContain('-');
  });

  it('TODO-VALIDATE: Empty title', async () => {
    const res = await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        title: '',
        description: 'Test Description',
        isCompleted: false,
      });

    expect(res.body.message[0]).toBe('title should not be empty');
  });

  it('TODO-GET-ALL', async () => {
    const res = await request(server)
      .get('/todos')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(Array.isArray(res.body.todos)).toBeTruthy();
  });

  it('TODO-UPDATE', async () => {
    const createResp = await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        title: 'Test Todo',
        description: 'Test Description',
        isCompleted: false,
      });

    expect(createResp.body).toBeDefined();

    const updateResp = await request(server)
      .patch(`/todos/${createResp.body.id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Updated Todo' })
      .expect(200);
  });

  it('TODO-DELETE', () => {
    return request(server)
      .delete(`/todos/${id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
  });
});
