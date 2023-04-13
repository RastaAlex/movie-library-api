import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import movieRoutes from './src/routes/moviesRoutes.js';
import userRoutes from './src/routes/usersRoutes.js';
import { sequelize } from './config/database.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(movieRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };

