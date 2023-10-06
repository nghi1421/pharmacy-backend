import 'reflect-metadata'
import { DataSource } from 'typeorm'
import {User} from './entity/User'
import 'dotenv/config'
import { Staff } from './entity/Staff'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { Position } from './entity/Position'
import { Customer } from './entity/Customer'
import { DrugCategory } from './entity/DrugCategory'

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Staff, Position, Customer, DrugCategory],
  namingStrategy: new SnakeNamingStrategy(),
})

AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
  })
  .catch((error) => console.log(error));

export { AppDataSource }
