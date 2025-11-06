const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoute'); // Adjust the path if necessary
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();

// ✅ Middleware
app.use(bodyParser.json());

// ✅ CORS configuration (supports both local + deployed frontend)
const corsOptions = {
  origin: [
    'https://nccproject.onrender.com', // your deployed frontend
    'http://localhost:5173'            // for local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

// ✅ API Routes
app.use('/api', userRoutes);

// ✅ Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Export the app for server.js
module.exports = app;
