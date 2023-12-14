import express, { Request, Response } from 'express';
import routesAPI from './routes/api'
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import config from './config/config'
import './config/firebase'
import { createServer } from "http";
import socket, { Socket } from "socket.io";

const app = express();
let corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}
app.use(helmet())
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
const httpServer = createServer(app);

const io = new socket.Server(httpServer);

io.on("connection", (socket: Socket) => {
  console.log('A user connected');

  socket.on('login', (username) => {
    socket.join(username);
    socket.to(username).emit('message', 'Welcome to the chat!');
  });

  socket.on('chat message', (username, message) => {
    io.to(username).emit('message', `${username}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

routesAPI(app)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(config.port, () => {
  return console.log(`Express is listening at http://localhost:${config.port}`);
});