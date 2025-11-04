import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smd-tunisie.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, skipping...');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('✅ Admin user created:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${admin.role}`);
    }

    // Create sample categories (optional)
    const categoriesCount = await prisma.category.count();
    
    if (categoriesCount === 0) {
      console.log('\n📦 Creating sample categories...');

      const categories = [
        {
          name: 'Power Tools',
          slug: 'power-tools',
          description: 'Electric and battery-powered tools for professionals',
          isActive: true,
        },
        {
          name: 'Hand Tools',
          slug: 'hand-tools',
          description: 'Manual tools for various applications',
          isActive: true,
        },
        {
          name: 'Hardware',
          slug: 'hardware',
          description: 'Screws, nails, bolts, and fasteners',
          isActive: true,
        },
        {
          name: 'Safety Equipment',
          slug: 'safety-equipment',
          description: 'Personal protective equipment and safety gear',
          isActive: true,
        },
      ];

      for (const category of categories) {
        await prisma.category.create({
          data: category,
        });
        console.log(`   ✓ Created category: ${category.name}`);
      }

      console.log('✅ Sample categories created');
    } else {
      console.log('\n⚠️  Categories already exist, skipping...');
    }

    console.log('\n🎉 Database seeding completed successfully\!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Login to admin dashboard with the credentials above');
    console.log('   3. Start adding your products\!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
