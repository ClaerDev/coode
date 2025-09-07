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
    
    // Use valid Unsplash collection images for programming/tech topics
    const techImages = [
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542903660-eedba2cda473?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop'
    ];
    
    products.push({
      name: productName,
      description: description,
      imageUrl: faker.helpers.arrayElement(techImages),
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