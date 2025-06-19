import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFeedback() {
  console.log('🌱 Seeding sample feedback...');

  // Sample feedback data
  const sampleFeedbacks = [
    {
      name: 'Sarah Thompson',
      email: 'sarah.t@email.com',
      message: 'Absolutely amazing experience at Steakz! The Wagyu tenderloin was cooked to perfection and the service was impeccable. The ambiance created the perfect atmosphere for our anniversary dinner.',
      rating: 5,
      status: 'APPROVED' as const
    },
    {
      name: 'Michael Rodriguez',
      email: 'mike.rodriguez@email.com',
      message: 'Outstanding food quality and presentation. The dry-aged ribeye was incredible and the sommelier\'s wine pairing was spot-on. Definitely coming back soon!',
      rating: 5,
      status: 'APPROVED' as const
    },
    {
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      message: 'Great steakhouse with excellent attention to detail. The truffle tagliatelle was heavenly. Only minor feedback - the wait time was a bit longer than expected.',
      rating: 4,
      status: 'APPROVED' as const
    },
    {
      name: 'David Wilson',
      email: 'david.w@email.com',
      message: 'First time dining at Steakz and it exceeded all expectations. The staff was knowledgeable and friendly. The Château Margaux wine was exceptional!',
      rating: 5,
      status: 'APPROVED' as const
    },
    {
      name: 'Jessica Miller',
      email: 'j.miller@email.com',
      message: 'Beautiful restaurant with a sophisticated atmosphere. The sea bass was perfectly prepared and the chocolate fondant dessert was divine.',
      rating: 4,
      status: 'APPROVED' as const
    },
    {
      name: 'Robert Johnson',
      email: 'robert.j@email.com',
      message: 'Steakz has become our go-to place for special occasions. The consistency in quality and service is remarkable. Highly recommend the chef\'s tasting menu.',
      rating: 5,
      status: 'PENDING' as const
    }
  ];

  try {
    // Clear existing feedback
    await prisma.feedback.deleteMany({});
    console.log('🗑️  Cleared existing feedback');

    // Create sample feedback
    for (const feedback of sampleFeedbacks) {
      await prisma.feedback.create({
        data: feedback
      });
    }

    console.log(`✅ Created ${sampleFeedbacks.length} sample feedback entries`);

    // Show summary
    const totalFeedback = await prisma.feedback.count();
    const approvedFeedback = await prisma.feedback.count({
      where: { status: 'APPROVED' }
    });
    const pendingFeedback = await prisma.feedback.count({
      where: { status: 'PENDING' }
    });

    console.log(`📊 Feedback Summary:`);
    console.log(`   Total: ${totalFeedback}`);
    console.log(`   Approved: ${approvedFeedback}`);
    console.log(`   Pending: ${pendingFeedback}`);

  } catch (error) {
    console.error('❌ Error seeding feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFeedback();
