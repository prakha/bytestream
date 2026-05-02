require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const uploadRoutes = require('./routes/uploadRoutes');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/v1', uploadRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'upload-service' });
});

app.listen(PORT, () => {
    console.log(`Upload Service running on port ${PORT}`);
});
