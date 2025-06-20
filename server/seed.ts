import { storage } from './storage.js';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create initial roadmap tasks
    const roadmapTasks = [
      {
        task: 'Initial project structure and schema setup',
        status: 'DONE',
        notes: 'Database schema, storage layer completed'
      },
      {
        task: 'Twilio voice webhook integration',
        status: 'DONE', 
        notes: 'WebSocket streaming configured'
      },
      {
        task: 'OpenAI Realtime API voice agent',
        status: 'DONE',
        notes: 'Speech-to-speech processing implemented'
      },
      {
        task: 'Intent detection and diamond search',
        status: 'DONE',
        notes: 'AI-powered intent analysis complete'
      },
      {
        task: 'Real-time dashboard frontend',
        status: 'TODO',
        notes: 'Live call monitoring interface'
      },
      {
        task: 'Production deployment and testing',
        status: 'TODO', 
        notes: 'Deploy to production environment'
      }
    ];

    for (const task of roadmapTasks) {
      await storage.createRoadmapTask(task);
    }

    // Create sample diamond inventory
    const sampleDiamonds = [
      {
        sku: 'DIA001',
        carat: '1.0',
        cut: 'Round',
        color: 'D',
        clarity: 'VVS1',
        price: 850000, // $8,500 in cents
        available: true,
        description: 'Exceptional round brilliant diamond with perfect color and clarity',
        certificateNumber: 'GIA-2141234567'
      },
      {
        sku: 'DIA002', 
        carat: '0.75',
        cut: 'Princess',
        color: 'E',
        clarity: 'VS1',
        price: 425000, // $4,250 in cents
        available: true,
        description: 'Beautiful princess cut with excellent brilliance',
        certificateNumber: 'GIA-2141234568'
      },
      {
        sku: 'DIA003',
        carat: '1.5',
        cut: 'Emerald',
        color: 'F',
        clarity: 'VS2',
        price: 1250000, // $12,500 in cents
        available: true,
        description: 'Stunning emerald cut with elegant proportions',
        certificateNumber: 'GIA-2141234569'
      },
      {
        sku: 'DIA004',
        carat: '0.5',
        cut: 'Round',
        color: 'G',
        clarity: 'SI1',
        price: 175000, // $1,750 in cents
        available: true,
        description: 'Classic round diamond perfect for engagement rings',
        certificateNumber: 'GIA-2141234570'
      },
      {
        sku: 'DIA005',
        carat: '2.0',
        cut: 'Oval',
        color: 'H',
        clarity: 'SI2',
        price: 1850000, // $18,500 in cents
        available: true,
        description: 'Magnificent oval diamond with exceptional fire',
        certificateNumber: 'GIA-2141234571'
      },
      {
        sku: 'DIA006',
        carat: '1.25',
        cut: 'Cushion',
        color: 'I',
        clarity: 'VS1',
        price: 675000, // $6,750 in cents
        available: true,
        description: 'Romantic cushion cut with vintage appeal',
        certificateNumber: 'GIA-2141234572'
      },
      {
        sku: 'DIA007',
        carat: '0.8',
        cut: 'Pear',
        color: 'J',
        clarity: 'VS2',
        price: 320000, // $3,200 in cents
        available: true,
        description: 'Elegant pear shape with beautiful symmetry',
        certificateNumber: 'GIA-2141234573'
      },
      {
        sku: 'DIA008',
        carat: '3.0',
        cut: 'Round',
        color: 'D',
        clarity: 'FL',
        price: 4500000, // $45,000 in cents
        available: true,
        description: 'Exceptional 3-carat flawless diamond, museum quality',
        certificateNumber: 'GIA-2141234574'
      }
    ];

    for (const diamond of sampleDiamonds) {
      await storage.createDiamond(diamond);
    }

    console.log('✅ Database seeded successfully');
    console.log(`📋 Created ${roadmapTasks.length} roadmap tasks`);
    console.log(`💎 Created ${sampleDiamonds.length} diamond inventory items`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}