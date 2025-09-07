#!/usr/bin/env tsx

import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { db } from '../src/drizzle/db';
import { CourseTable, ProductTable, CourseProductTable } from '../src/drizzle/schema';

const COURSE_CATEGORIES = [
  'Web Development',
  'Data Science', 
  'Mobile Development',
  'DevOps',
  'Artificial Intelligence',
  'Cybersecurity',
  'UI/UX Design',
  'Game Development',
  'Blockchain',
  'Cloud Computing'
];

const PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 
  'Java', 'C++', 'Swift', 'Kotlin', 'Go', 'Rust', 'PHP'
];

async function generateCourses() {
  const courses = [];
  
  for (let i = 0; i < 15; i++) {
    const category = faker.helpers.arrayElement(COURSE_CATEGORIES);
    const language = faker.helpers.arrayElement(PROGRAMMING_LANGUAGES);
    const level = faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']);
    
    const courseName = faker.helpers.arrayElement([
      `Complete ${language} ${category} Course`,
      `${level} ${language} Development`,
      `Master ${category} with ${language}`,
      `${language} ${category} Bootcamp`,
      `Professional ${category} using ${language}`,
      `${category}: From Zero to Hero with ${language}`,
      `Advanced ${language} for ${category}`,
      `${category} Fundamentals with ${language}`
    ]);

    const description = `Learn ${category.toLowerCase()} with ${language} in this comprehensive ${level.toLowerCase()}-level course. ${faker.lorem.sentences(3)} 

Key topics covered:
${Array.from({ length: 4 }, () => `• ${faker.hacker.phrase()}`).join('\n')}

By the end of this course, you'll be able to:
${Array.from({ length: 3 }, () => `• ${faker.lorem.sentence()}`).join('\n')}

Perfect for ${level === 'Beginner' ? 'those new to programming' : level === 'Intermediate' ? 'developers with some experience' : 'experienced developers looking to master advanced concepts'}.`;

    courses.push({
      name: courseName,
      description: description
    });
  }
  
  return courses;
}

async function generateProducts() {
  const products = [];
  
  for (let i = 0; i < 15; i++) {
    const category = faker.helpers.arrayElement(COURSE_CATEGORIES);
    const language = faker.helpers.arrayElement(PROGRAMMING_LANGUAGES);
    const courseType = faker.helpers.arrayElement(['Course', 'Masterclass', 'Bootcamp', 'Workshop', 'Complete Guide']);
    
    const productName = `${language} ${category} ${courseType}`;
    
    const features = [
      'Lifetime access to all course materials',
      'Certificate of completion',
      'Access to exclusive community',
      'Regular content updates',
      'Mobile and desktop access',
      'Downloadable resources and code samples'
    ];
    
    const randomFeatures = faker.helpers.arrayElements(features, { min: 3, max: 5 });
    
    const description = `${faker.lorem.sentences(2)}

What's included:
${randomFeatures.map(feature => `• ${feature}`).join('\n')}

${faker.lorem.sentences(2)}

Perfect for professionals, students, and anyone looking to advance their career in ${category.toLowerCase()}.`;

    const basePrice = faker.helpers.arrayElement([29, 39, 49, 59, 79, 99, 129, 149, 199, 249, 299]);
    
    products.push({
      name: productName,
      description: description,
      imageUrl: `https://images.unsplash.com/photo-${faker.number.int({ min: 1500000000000, max: 1700000000000 })}?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
      priceInDollars: basePrice,
      status: faker.helpers.arrayElement(['public', 'public', 'public', 'private']) as 'public' | 'private' // 75% public, 25% private
    });
  }
  
  return products;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Generate and insert courses
    console.log('📚 Generating courses...');
    const courseData = await generateCourses();
    const insertedCourses = await db.insert(CourseTable).values(courseData).returning();
    console.log(`✅ Created ${insertedCourses.length} courses`);
    
    // Generate and insert products
    console.log('🛍️  Generating products...');
    const productData = await generateProducts();
    const insertedProducts = await db.insert(ProductTable).values(productData).returning();
    console.log(`✅ Created ${insertedProducts.length} products`);
    
    // Create course-product relationships (each course gets paired with corresponding product)
    console.log('🔗 Creating course-product relationships...');
    const courseProductData = insertedCourses.map((course, index) => ({
      courseId: course.id,
      productId: insertedProducts[index].id
    }));
    
    await db.insert(CourseProductTable).values(courseProductData);
    console.log(`✅ Created ${courseProductData.length} course-product relationships`);
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`• Courses created: ${insertedCourses.length}`);
    console.log(`• Products created: ${insertedProducts.length}`);
    console.log(`• Public products: ${insertedProducts.filter(p => p.status === 'public').length}`);
    console.log(`• Private products: ${insertedProducts.filter(p => p.status === 'private').length}`);
    console.log(`• Course-Product relationships: ${courseProductData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };