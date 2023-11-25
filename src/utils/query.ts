import { Repository } from "typeorm";
import { AppDataSource } from "../dataSource";

export const isExistsQuery = (query: string) =>
  `SELECT EXISTS(${query}) AS "exists"`;

export const checkExistUniqueCreate = (
  repository: Repository<any>,
  columnName: string,
  param: any
) => 
  AppDataSource.query(isExistsQuery(
      repository
          .createQueryBuilder()
          .select('1')
          .where(`${columnName} = ?`)
          .getQuery()
      ), [param]
  );

export const checkExistUniqueUpdate = (
  repository: Repository<any>,
  columnName: string,
  params: any
) => 
  AppDataSource.query(isExistsQuery(
      repository
          .createQueryBuilder()
          .select('1')
          .where(`${columnName} = ? AND id <> ?`)
          .getQuery()
      ), params
  );