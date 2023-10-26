import express, { Request, Response } from 'express';
import routesAPI from './routes/api'
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import config from './config/config'

const app = express();

let corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}

app.use(helmet())
app.use(cors(corsOptions));
app.use(cookieParser()); 
app.use(bodyParser.json());

routesAPI(app)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(config.port, () => {
  return console.log(`Express is listening at http://localhost:${config.port}`);
});