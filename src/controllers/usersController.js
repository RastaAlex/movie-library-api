import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';

const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const STATUS_CREATED = 201;
const STATUS_OK = 200;
const STATUS_SERVER_ERROR = 500;

const register = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(STATUS_BAD_REQUEST).json({ message: 'Email must be valid' });
    }

    if (password !== confirmPassword) {
      return res.status(STATUS_BAD_REQUEST).json({ message: 'Passwords do not match.' });
    }

    if (!isValidPassword(password)) {
      return res.status(STATUS_BAD_REQUEST).json({ message: 'Password must be a string' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(STATUS_BAD_REQUEST).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(STATUS_CREATED).json({ token, status: 1 });
  } catch (error) {
    res.status(STATUS_SERVER_ERROR).json({ message: 'Error while registering user', error: error.message  });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(STATUS_NOT_FOUND).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(STATUS_BAD_REQUEST).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(STATUS_OK).json({ token, status: 1 });
  } catch (error) {
    res.status(STATUS_SERVER_ERROR).json({ message: 'Error while logging in', error });
  }
};

const isValidPassword = (password) => {
  return typeof password === 'string' && password.length > 0;
};

export default {
  register,
  login,
};
