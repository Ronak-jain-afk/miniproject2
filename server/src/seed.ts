import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from './config/env';
import { User } from './modules/users/user.model';

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@attendance.edu' });
  if (existing) {
    console.log('Admin user already exists. Skipping seed.');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  await User.create({
    email: 'admin@attendance.edu',
    password: hashedPassword,
    role: 'admin',
    status: 'active',
    profile: {
      firstName: 'System',
      lastName: 'Admin',
    },
  });

  console.log('Seed complete. Default admin:');
  console.log('  Email:    admin@attendance.edu');
  console.log('  Password: Admin@123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
