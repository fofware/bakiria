import * as dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno desde .env
// Importing the required modules
import express from 'express';
import { passport } from './auth/passport';
import authrt from './auth/routes';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(morgan('dev')); // Middleware para registrar las solicitudes HTTP

const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/authdb';
console.log('Conectando a MongoDB en:', MONGODB_URI);
// --- Conexión a MongoDB ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- Configuración de Middleware ---
app.use(cors()); // Permite solicitudes desde el frontend de Angular

app.get('/', (req, res) => {
  console.log('Hello World!');
  res.json({ message: 'Hello from the /' });
  });

app.get('/api/', (req, res) => {
  res.json({ message: 'Hello from the API!' });
  });

app.use(authrt);


const port = process.env['APP_PORT'] || 3000;
console.log('Hello World!');
app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});


