#!/usr/bin/env tsx

import 'dotenv/config';
import { db } from '../src/drizzle/db';
import { PurchaseTable } from '../src/drizzle/schema';
import { sql } from 'drizzle-orm';

async function cleanDummyPurchases() {
  console.log('🧹 Cleaning up dummy purchases with problematic session IDs...');
  
  try {
    // Delete purchases with dummy session ID patterns
    const deletedPurchases = await db
      .delete(PurchaseTable)
      .where(
        sql`
          ${PurchaseTable.stripeSessionId} LIKE 'cs_test_dummy_%' OR 
          ${PurchaseTable.stripeSessionId} LIKE 'cs_spike_%' OR 
          ${PurchaseTable.stripeSessionId} LIKE '%_dummy_%' OR 
          ${PurchaseTable.stripeSessionId} LIKE '%_spike_%' OR
          ${PurchaseTable.stripeSessionId} ~ 'cs_[A-Za-z0-9]+_[0-9]{13,}_[0-9]+' OR
          LENGTH(${PurchaseTable.stripeSessionId}) > 50
        `
      )
      .returning();
    
    console.log(`✅ Deleted ${deletedPurchases.length} dummy purchases`);
    
    if (deletedPurchases.length > 0) {
      console.log('Deleted session IDs:');
      deletedPurchases.forEach((purchase, index) => {
        console.log(`  ${index + 1}. ${purchase.stripeSessionId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error cleaning dummy purchases:', error);
    process.exit(1);
  }
}

// Run the cleanup function if this script is executed directly
if (require.main === module) {
  cleanDummyPurchases()
    .then(() => {
      console.log('✅ Cleanup process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup process failed:', error);
      process.exit(1);
    });
}

export { cleanDummyPurchases };