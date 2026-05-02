const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    console.log('Auth Headers:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('JWT_SECRET prefix:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) : 'MISSING');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Should contain userId
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
