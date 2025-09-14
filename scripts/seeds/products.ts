import { faker } from '@faker-js/faker';
import { db } from '../../src/drizzle/db';
import { ProductTable, CourseProductTable, productTags } from '../../src/drizzle/schema';

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

// Use valid Unsplash collection images for programming/tech topics
const TECH_IMAGES = [
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

async function generateProductData(count: number = 15) {
  const products = [];
  
  for (let i = 0; i < count; i++) {
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
    
    // Generate realistic tags - some products have multiple tags, some have none
    const numTags = faker.number.int({ min: 0, max: 3 });
    const selectedTags = faker.helpers.arrayElements(productTags, numTags);
    
    products.push({
      name: productName,
      description: description,
      imageUrl: faker.helpers.arrayElement(TECH_IMAGES),
      priceInDollars: basePrice,
      status: faker.helpers.arrayElement(['public', 'public', 'public', 'private']) as 'public' | 'private', // 75% public, 25% private
      tags: selectedTags
    });
  }
  
  return products;
}

export async function seedProducts(courses: any[], count: number = 15) {
  console.log('🛍️  Generating products...');
  
  const productData = await generateProductData(count);
  const insertedProducts = await db.insert(ProductTable).values(productData).returning();
  
  console.log(`✅ Created ${insertedProducts.length} products`);
  
  // Create course-product relationships (each course gets paired with corresponding product)
  console.log('🔗 Creating course-product relationships...');
  const courseProductData = courses.map((course, index) => ({
    courseId: course.id,
    productId: insertedProducts[index].id
  }));
  
  await db.insert(CourseProductTable).values(courseProductData);
  console.log(`✅ Created ${courseProductData.length} course-product relationships`);
  
  return insertedProducts;
}