import express from 'express';
import routesAPI from './routes/api'
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet'

const app = express();
const port = 3000;

app.use(helmet())
app.use(cors());
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.json({
    data: 'Test server'
  })
});

routesAPI(app)

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});