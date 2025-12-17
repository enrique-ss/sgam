import knex from 'knex';

const connection = knex({
  client: 'mysql2',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'senacrs',
    database: 'rsti_final'
  },
  pool: {
    min: 2,
    max: 10
  }
});

export default connection;