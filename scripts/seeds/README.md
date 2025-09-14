# Database Seeding System

A modular and orchestrated approach to populating your development database with realistic dummy data.

## 📁 Structure

```
scripts/seeds/
├── index.ts        # Main orchestrator - coordinates all seeding
├── courses.ts      # Course data generation
├── products.ts     # Product data generation and course relationships  
├── sales.ts        # Sales/purchase data with realistic patterns
└── README.md       # This documentation
```

## 🚀 Quick Start

### Seed Everything (Recommended)
```bash
npm run db:seed
```
This will seed courses, products, and sales data in the correct order with dependencies.

### Seed Individual Components
```bash
npm run db:seed:courses   # Only courses
npm run db:seed:products  # Only products (requires existing courses)
npm run db:seed:sales     # Only sales (requires existing products)
```

## 🎛️ Advanced Options

### Custom Counts
```bash
# Seed with custom quantities
npm run db:seed -- --courses-count=25 --products-count=25
```

### Skip Components
```bash
# Seed only courses and products, skip sales
npm run db:seed -- --skip-sales

# Seed only sales (use existing courses/products)
npm run db:seed -- --skip-courses --skip-products
```

### Help
```bash
npm run db:seed -- --help
```

## 📊 What Gets Generated

### Courses (15 by default)
- **Realistic names**: "Complete JavaScript Web Development Course", "Advanced Python for AI"
- **Detailed descriptions**: Include key topics, learning outcomes, and target audience
- **Categories**: Web Dev, Data Science, Mobile, DevOps, AI, Cybersecurity, etc.
- **Technologies**: JavaScript, Python, React, Node.js, Java, etc.

### Products (15 by default)
- **Linked to courses**: Each product connects to a corresponding course
- **Realistic pricing**: $29-$299 range based on course complexity
- **Tags**: Products get random tags like "recommended", "popular", "new", "bestseller", "featured"
- **Tech images**: Valid Unsplash URLs for programming/tech visuals
- **Status distribution**: 75% public, 25% private
- **Rich descriptions**: Include features, benefits, and what's included

### Sales Data (50-150+ purchases)
- **20 Dummy users**: Realistic names and emails for purchases
- **Historical patterns**: Purchases spread over last 6 months
- **Recent spike**: 20-40 recent purchases simulating promotion/viral moment
- **Realistic pricing**: 30% get discounts (10-30% off), recent spike gets bigger discounts (20-50% off)
- **Refunds**: 5% of purchases are refunded with realistic timing
- **Revenue tracking**: Automatic calculation of totals and averages

## 🔧 Customization

### Modify Generation Logic

Each seeder can be customized by editing its respective file:

- **courses.ts**: Modify categories, languages, or description templates
- **products.ts**: Change pricing ranges, features, or image sources  
- **sales.ts**: Adjust purchase patterns, discount rates, or user profiles

### Add New Seeders

1. Create your seeder in `scripts/seeds/yourSeeder.ts`
2. Export a main function that takes any options
3. Add it to the orchestrator in `index.ts`
4. Add npm script in `package.json`

Example structure:
```typescript
export async function seedYourData(options: YourOptions = {}) {
  console.log('🎯 Seeding your data...');
  // Your seeding logic here
  return insertedData;
}
```

## 📈 Sample Output

```
🌱 Starting comprehensive database seeding...

📚 === SEEDING COURSES ===
📚 Generating courses...
✅ Created 15 courses

🛍️  === SEEDING PRODUCTS ===
🛍️  Generating products...
✅ Created 15 products
🔗 Creating course-product relationships...
✅ Created 15 course-product relationships

💰 === SEEDING SALES ===
💰 Starting sales data seeding...
👥 Creating dummy users...
✅ Created 20 new users
📊 Fetching existing users...
Found 22 users and 15 products
📈 Generating sales data...
💾 Inserting 164 purchases...
  ✅ Inserted 164/164 purchases
✅ Created 164 sales records
   • Refunded purchases: 8
   • Total revenue: $18,456.32
   • Average order value: $118.31

🎉 === SEEDING COMPLETED SUCCESSFULLY ===
⏱️  Total time: 3.45 seconds

📊 Final Summary:
• Courses: 15 created
• Products: 15 created  
• Sales: Created with realistic purchase patterns
```

## 🧹 Cleanup

To clear all data before re-seeding:
```bash
npm run db:clear
```

## 💡 Tips

1. **Always migrate first**: Run `npm run db:migrate` before seeding
2. **Incremental seeding**: You can run individual seeders without affecting others
3. **Development only**: This seeding system is designed for development/testing environments
4. **Customizable**: All generation parameters can be adjusted in the individual seeder files
5. **Reproducible**: Uses Faker.js for consistent but varied dummy data

## 🚨 Important Notes

- **Dependencies**: Products require courses, sales require products
- **User data**: Sales seeder creates dummy users with fake emails (safe for development)
- **Images**: Uses Unsplash URLs that are valid and programming-related
- **Stripe IDs**: Generates fake but properly formatted Stripe session IDs
- **Timestamps**: Historical data uses realistic date patterns over last 6 months