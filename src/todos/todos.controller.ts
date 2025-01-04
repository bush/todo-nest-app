import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  BadRequestException,
  ParseIntPipe
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryDto } from './dto/query-todo.dto';
import { Logger, ValidationPipe } from '@nestjs/common';



@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(protected readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    Logger.debug('Creating todo ...', TodosController.name);
    try {
      return this.todosService.create(createTodoDto);
    } catch(error) {
      Logger.log(error)
    }
  }

  //findAll(@Query('next') next?: string,  @Query('limit') limit?: number) {

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) query: QueryDto) {
    const { next, limit } = query;
    return this.todosService.findAll(next, limit);
  }

  // Not we don't need to define a custom error here, its just an
  // example to show how to override the error and provide a custom
  // message
  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
        exceptionFactory: () =>
          new BadRequestException('Invalid UUID format for Todo ID'),
      }),
    )
    id: string,
  ) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
