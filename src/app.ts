import express, { NextFunction, Request, Response } from 'express';
import routesAPI from './routes/api'
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import config from './config/config'
import './config/firebase'
import { createServer } from "http";
import { Socket, Server } from "socket.io";
import { checkTokenSocket } from './middlewares/checkTokenSocket';
import chatService from './services/chatService';

const app = express();
const httpServer = createServer(app);

let corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}
app.use(helmet())
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost'
  }
});

routesAPI(app)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

io
  .use((socket: Socket, next: NextFunction) => {
    checkTokenSocket(socket, next)
  })
  .on("connection", (socket: Socket) => {
    chatService.handleSocket(socket, io)
  });

httpServer.listen(config.port, () => {
  return console.log(`Express is listening at http://localhost:${config.port}`);
});