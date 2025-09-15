#!/usr/bin/env tsx

import 'dotenv/config';
import { seedCourses } from './courses';
import { seedProducts } from './products';
import { seedSales } from './sales';
import type { CourseTable, ProductTable } from '../../src/drizzle/schema';

interface SeedOptions {
  courses?: {
    count?: number;
  };
  products?: {
    count?: number;
  };
  sales?: {
    historicalCount?: number;
    recentSpikeCount?: number;
    refundRate?: number;
    discountRate?: number;
  };
  skipCourses?: boolean;
  skipProducts?: boolean;
  skipSales?: boolean;
}

export async function seedAll(options: SeedOptions = {}) {
  console.log('🌱 Starting comprehensive database seeding...');
  
  const startTime = Date.now();
  
  try {
    let courses: (typeof CourseTable.$inferSelect)[] = [];
    let products: (typeof ProductTable.$inferSelect)[] = [];
    
    if (!options.skipCourses) {
      console.log('\n📚 === SEEDING COURSES ===');
      courses = await seedCourses(options.courses?.count);
    } else {
      console.log('\n📚 Skipping courses seeding...');
    }
    
    if (!options.skipProducts) {
      console.log('\n🛍️  === SEEDING PRODUCTS ===');
      if (courses.length === 0 && !options.skipCourses) {
        throw new Error('No courses available for product relationships');
      }
      products = await seedProducts(courses, options.products?.count);
    } else {
      console.log('\n🛍️  Skipping products seeding...');
    }
    
    if (!options.skipSales) {
      console.log('\n💰 === SEEDING SALES ===');
      await seedSales(products, options.sales);
    } else {
      console.log('\n💰 Skipping sales seeding...');
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 === SEEDING COMPLETED SUCCESSFULLY ===');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    
    console.log('\n📊 Final Summary:');
    if (!options.skipCourses) console.log(`• Courses: ${courses.length} created`);
    if (!options.skipProducts) console.log(`• Products: ${products.length} created`);
    if (!options.skipSales) console.log('• Sales: Created with realistic purchase patterns');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌱 Database Seeding CLI

Usage: npm run db:seed [options]

Options:
  --courses-only     Seed only courses
  --products-only    Seed only products (requires existing courses)
  --sales-only       Seed only sales (requires existing products)
  --skip-courses     Skip courses seeding
  --skip-products    Skip products seeding  
  --skip-sales       Skip sales seeding
  --courses-count=N  Number of courses to create (default: 15)
  --products-count=N Number of products to create (default: 15)
  --help, -h         Show this help message

Examples:
  npm run db:seed                    # Seed everything
  npm run db:seed --courses-only     # Only seed courses
  npm run db:seed --skip-sales       # Seed courses and products, skip sales
  npm run db:seed --courses-count=25 # Seed 25 courses instead of default 15
    `);
    process.exit(0);
  }

  const options: SeedOptions = {};

  if (args.includes('--courses-only')) {
    options.skipProducts = true;
    options.skipSales = true;
  }
  if (args.includes('--products-only')) {
    options.skipCourses = true;
    options.skipSales = true;
  }
  if (args.includes('--sales-only')) {
    options.skipCourses = true;
    options.skipProducts = true;
  }
  if (args.includes('--skip-courses')) {
    options.skipCourses = true;
  }
  if (args.includes('--skip-products')) {
    options.skipProducts = true;
  }
  if (args.includes('--skip-sales')) {
    options.skipSales = true;
  }

  const coursesCountArg = args.find(arg => arg.startsWith('--courses-count='));
  if (coursesCountArg) {
    const countValue = coursesCountArg.split('=')[1];
    if (countValue) {
      const count = parseInt(countValue);
      if (!isNaN(count) && count > 0) {
        options.courses = { count };
      }
    }
  }

  const productsCountArg = args.find(arg => arg.startsWith('--products-count='));
  if (productsCountArg) {
    const countValue = productsCountArg.split('=')[1];
    if (countValue) {
      const count = parseInt(countValue);
      if (!isNaN(count) && count > 0) {
        options.products = { count };
      }
    }
  }

  await seedAll(options);
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}