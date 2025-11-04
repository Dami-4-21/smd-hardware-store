import prisma from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@smd-tunisie.com' }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log('Email: admin@smd-tunisie.com');
      console.log('If you forgot the password, delete the user first.');
      await prisma.$disconnect();
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@smd-tunisie.com',
        username: 'admin',
        passwordHash,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
        companyName: 'SMD Tunisie',
        rneNumber: 'ADMIN001',
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('==================');
    console.log('Email:    admin@smd-tunisie.com');
    console.log('Password: admin123');
    console.log('');
    console.log('Go to: http://localhost:5174');
    console.log('');

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
