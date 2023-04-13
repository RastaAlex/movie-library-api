import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'Authentication required' });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET); 

    req.user = await User.findByPk(decodedData.id);

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication error' });
  }
};

export default authMiddleware;
