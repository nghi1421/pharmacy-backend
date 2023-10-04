import express from 'express';
const app = express();
const port = 3000;
import { AppDataSource } from "./dataSource"
import { User } from './entity/User'

app.get('/', async (req, res) => {

  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find()
  
  res.json({
    data: users
  })
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});