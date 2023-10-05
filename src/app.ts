import express from 'express';
import routesAPI from './routes/api'
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

const app = express();
const port = 3000;

app.use(helmet())
app.use(cors());
app.use(cookieParser()); 
app.use(bodyParser.json());

routesAPI(app)

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});