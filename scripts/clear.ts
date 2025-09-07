#!/usr/bin/env tsx

import 'dotenv/config';
import { db } from '../src/drizzle/db';
import { CourseTable, ProductTable, CourseProductTable, PurchaseTable } from '../src/drizzle/schema';

async function clearDatabase() {
  console.log('🗑️  Clearing database...');
  
  try {
    // Delete in correct order due to foreign keys
    await db.delete(PurchaseTable);
    console.log('✅ Cleared purchases');
    
    await db.delete(CourseProductTable);
    console.log('✅ Cleared course-product relationships');
    
    await db.delete(ProductTable);
    console.log('✅ Cleared products');
    
    await db.delete(CourseTable);
    console.log('✅ Cleared courses');
    
    console.log('🎉 Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log('✅ Clear process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Clear process failed:', error);
      process.exit(1);
    });
}

export { clearDatabase };