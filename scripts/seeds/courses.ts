import { faker } from '@faker-js/faker';
import { db } from '../../src/drizzle/db';
import { CourseTable } from '../../src/drizzle/schema';

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

async function generateCourseData(count: number = 15) {
  const courses = [];
  
  for (let i = 0; i < count; i++) {
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

export async function seedCourses(count: number = 15) {
  console.log('📚 Generating courses...');
  
  const courseData = await generateCourseData(count);
  const insertedCourses = await db.insert(CourseTable).values(courseData).returning();
  
  console.log(`✅ Created ${insertedCourses.length} courses`);
  return insertedCourses;
}