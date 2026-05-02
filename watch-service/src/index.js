const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const videoRoutes = require('./routes/videoRoutes');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/v1/videos', videoRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'ByteStream Watch Service' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Watch Service running on port ${PORT}`);
});
