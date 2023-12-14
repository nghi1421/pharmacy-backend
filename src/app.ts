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
    origin: '*'
  }
});

routesAPI(app)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

io
  .use((socket: Socket, next: NextFunction) => {
    const { token } = socket.handshake.query;
    if (token === 'my token') {
      console.log('authenticated success')
      next();
    }
    else {
      console.log('authenticated failed')
      const err: any = new Error("not authorized");
      err.data = { content: "Authenticate failed" };
      next(err)
    }
  })
  .on("connection", (socket: Socket) => {
    console.log('A user connected');

    socket.on('login', (roomId) => {
      socket.join(roomId);
    });

    socket.on('chat message', (roomId, message) => {

      io.to(roomId).emit('message', `${roomId}: ${message}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

httpServer.listen(config.port, () => {
  return console.log(`Express is listening at http://localhost:${config.port}`);
});