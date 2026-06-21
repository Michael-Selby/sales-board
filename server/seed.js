const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin account already exists:', existing.username);
      process.exit(0);
    }

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      role: 'admin',
    });

    console.log('Admin account created successfully:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Name:', admin.name);

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
