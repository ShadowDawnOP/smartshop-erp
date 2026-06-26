const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await User.deleteMany({});

    await User.create({
      name: 'Shop Owner',
      email: 'owner@shopsakhi.com',
      password: 'owner123@Yo',
      role: 'owner'
    });

    await User.create({
      name: 'Ravi Kumar',
      email: 'ravi@shopsakhi.com',
      password: 'ravi123',
      role: 'employee'
    });

    console.log('Users created successfully');
    console.log('Owner:    owner@shopsakhi.com / owner123@Yo');
    console.log('Employee: ravi@shopsakhi.com  / ravi123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();