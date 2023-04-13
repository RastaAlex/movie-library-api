import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';

const register = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Email must be valid' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be a string' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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

    res.status(201).json({ token, status: 1 });
  } catch (error) {
    res.status(500).json({ message: 'Error while registering user', error: error.message  });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, status: 1 });
  } catch (error) {
    res.status(500).json({ message: 'Error while logging in', error });
  }
};

const isValidPassword = (password) => {
  return typeof password === 'string' && password.length > 0;
};

export default {
  register,
  login,
};
