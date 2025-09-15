import { faker } from '@faker-js/faker';
import { db } from '../../src/drizzle/db';
import { UserTable, PurchaseTable } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';

type ProductForSales = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInDollars: number;
};

type UserForSales = {
  id: string;
  name: string;
  email: string;
};

const DUMMY_USERS = [
  { name: 'John Smith', email: 'john.smith@example.com' },
  { name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
  { name: 'Michael Brown', email: 'michael.brown@example.com' },
  { name: 'Emily Davis', email: 'emily.davis@example.com' },
  { name: 'David Wilson', email: 'david.wilson@example.com' },
  { name: 'Jessica Taylor', email: 'jessica.taylor@example.com' },
  { name: 'Christopher Anderson', email: 'chris.anderson@example.com' },
  { name: 'Amanda Martinez', email: 'amanda.martinez@example.com' },
  { name: 'Daniel Thomas', email: 'daniel.thomas@example.com' },
  { name: 'Ashley Garcia', email: 'ashley.garcia@example.com' },
  { name: 'Matthew Rodriguez', email: 'matthew.rodriguez@example.com' },
  { name: 'Jennifer Lopez', email: 'jennifer.lopez@example.com' },
  { name: 'Andrew Hernandez', email: 'andrew.hernandez@example.com' },
  { name: 'Michelle Moore', email: 'michelle.moore@example.com' },
  { name: 'James Jackson', email: 'james.jackson@example.com' },
  { name: 'Nicole White', email: 'nicole.white@example.com' },
  { name: 'Ryan Lewis', email: 'ryan.lewis@example.com' },
  { name: 'Samantha Lee', email: 'samantha.lee@example.com' },
  { name: 'Kevin Walker', email: 'kevin.walker@example.com' },
  { name: 'Laura Hall', email: 'laura.hall@example.com' }
];

async function createDummyUsers() {
  const users = [];
  
  for (const user of DUMMY_USERS) {
    const existingUser = await db.query.UserTable.findFirst({
      where: eq(UserTable.email, user.email)
    });
    
    if (!existingUser) {
      users.push({
        clerkUserId: `user_${faker.string.alphanumeric(10)}`,
        email: user.email,
        name: user.name,
        role: 'user' as const,
        imageUrl: faker.image.avatar()
      });
    }
  }
  
  if (users.length > 0) {
    const insertedUsers = await db.insert(UserTable).values(users).returning();
    console.log(`✅ Created ${insertedUsers.length} new users`);
    return insertedUsers;
  }
  
  console.log('ℹ️  All dummy users already exist');
  return [];
}

async function getAllUsers() {
  return db.query.UserTable.findMany({
    columns: {
      id: true,
      name: true,
      email: true
    }
  });
}

async function generateSalesData(users: UserForSales[], products: ProductForSales[], options: {
  historicalCount?: number;
  recentSpikeCount?: number;
  refundRate?: number;
  discountRate?: number;
} = {}) {
  const {
    historicalCount = faker.number.int({ min: 50, max: 150 }),
    recentSpikeCount = faker.number.int({ min: 20, max: 40 }),
    refundRate = 0.05,
    discountRate = 0.3
  } = options;

  const purchases = [];
  const now = new Date();
  
  for (let i = 0; i < historicalCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const product = faker.helpers.arrayElement(products);
    
    const daysAgo = faker.number.int({ min: 1, max: 180 });
    const purchaseDate = faker.date.recent({ days: daysAgo });
    
    const hasDiscount = faker.datatype.boolean({ probability: discountRate });
    const discountPercent = hasDiscount ? faker.number.float({ min: 0.1, max: 0.3 }) : 0;
    const originalPriceCents = product.priceInDollars * 100;
    const finalPriceCents = Math.round(originalPriceCents * (1 - discountPercent));
    
    const isRefunded = faker.datatype.boolean({ probability: refundRate });
    const refundedAt = isRefunded 
      ? faker.date.between({ from: purchaseDate, to: now })
      : null;
    
    purchases.push({
      pricePaidInCents: finalPriceCents,
      productDetails: {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl
      },
      userId: user.id,
      productId: product.id,
      stripeSessionId: `cs_test_dummy_${faker.string.alphanumeric(15)}_${i}`,
      refundedAt,
      createdAt: purchaseDate,
      updatedAt: purchaseDate
    });
  }

  // Generate recent sales spike (promotion or viral moment)
  for (let i = 0; i < recentSpikeCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const product = faker.helpers.arrayElement(products);
    
    const purchaseDate = faker.date.recent({ days: 7 });
    
    const discountPercent = faker.number.float({ min: 0.2, max: 0.5 }); // 20-50% off
    const originalPriceCents = product.priceInDollars * 100;
    const finalPriceCents = Math.round(originalPriceCents * (1 - discountPercent));
    
    purchases.push({
      pricePaidInCents: finalPriceCents,
      productDetails: {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl
      },
      userId: user.id,
      productId: product.id,
      stripeSessionId: `cs_test_dummy_spike_${faker.string.alphanumeric(10)}_${i}`,
      refundedAt: null,
      createdAt: purchaseDate,
      updatedAt: purchaseDate
    });
  }
  
  return purchases;
}

export async function seedSales(products: ProductForSales[], options: {
  historicalCount?: number;
  recentSpikeCount?: number;
  refundRate?: number;
  discountRate?: number;
} = {}) {
  console.log('💰 Starting sales data seeding...');
  
  console.log('👥 Creating dummy users...');
  await createDummyUsers();
  
  // Get all users
  console.log('📊 Fetching existing users...');
  const users = await getAllUsers();
  
  if (users.length === 0) {
    throw new Error('No users found. Cannot generate sales without users.');
  }
  
  if (products.length === 0) {
    console.log('📦 No products provided, fetching from database...');
    products = await db.query.ProductTable.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        priceInDollars: true
      }
    });
    
    if (products.length === 0) {
      throw new Error('No products found. Cannot generate sales without products.');
    }
    
    console.log(`Found ${products.length} products in database`);
  }
  
  console.log(`Found ${users.length} users and ${products.length} products`);
  
  // Generate sales data
  console.log('📈 Generating sales data...');
  const allPurchases = await generateSalesData(users, products, options);
  
  console.log(`💾 Inserting ${allPurchases.length} purchases...`);
  const batchSize = 50;
  let insertedCount = 0;
  
  for (let i = 0; i < allPurchases.length; i += batchSize) {
    const batch = allPurchases.slice(i, i + batchSize);
    await db.insert(PurchaseTable).values(batch);
    insertedCount += batch.length;
    console.log(`  ✅ Inserted ${insertedCount}/${allPurchases.length} purchases`);
  }
  
  const refundedCount = allPurchases.filter(p => p.refundedAt).length;
  const totalRevenue = allPurchases
    .filter(p => !p.refundedAt)
    .reduce((sum, p) => sum + p.pricePaidInCents, 0) / 100;
  const avgOrderValue = totalRevenue / (allPurchases.length - refundedCount);
  
  console.log(`✅ Created ${allPurchases.length} sales records`);
  console.log(`   • Refunded purchases: ${refundedCount}`);
  console.log(`   • Total revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`   • Average order value: $${avgOrderValue.toFixed(2)}`);
  
  return allPurchases;
}