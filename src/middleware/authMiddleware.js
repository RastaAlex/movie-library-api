import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const STATUS_FORBIDDEN = 403;
const STATUS_UNAUTHORIZED = 401;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(STATUS_FORBIDDEN).json({ message: 'Authentication required' });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decodedData.id);

    if (!req.user) {
      return res.status(STATUS_UNAUTHORIZED).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(STATUS_UNAUTHORIZED).json({ message: 'Authentication error' });
  }
};

export default authMiddleware;
