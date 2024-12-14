import { Attribute } from 'electrodb';

export default () => {
  const attributes: { readonly [x: string]: Attribute } = {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    isCompleted: { type: 'boolean' },
  };

  return {
    schema: {
      model: {
        entity: 'Todo',
        version: '1',
        service: 'TodoApp',
      },
      attributes: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        isCompleted: { type: 'boolean' },
      },
      indexes: {
        primary: {
          pk: { field: process.env.TODO_TABLE_PKNAME, composite: [] },
          sk: { field: 'sk', composite: ['id'] },
        },
      },
    },
  };
};
