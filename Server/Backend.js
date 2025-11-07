const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoute');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();

// ✅ Middleware
app.use(bodyParser.json());

// ✅ CORS configuration
const corsOptions = {
  origin: [
    'https://nccproject.onrender.com', // your frontend domain
    'http://localhost:5173'            // for local testing
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ For preflight OPTIONS requests
app.options('*', cors(corsOptions));

// ✅ Routes
app.use('/api', userRoutes);

// ✅ Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
