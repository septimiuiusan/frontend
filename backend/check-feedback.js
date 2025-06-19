const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFeedback() {
  try {
    console.log('🔍 Checking Feedback System...\n');

    // Count total feedback
    const totalCount = await prisma.feedback.count();
    console.log(`📊 Total feedback entries: ${totalCount}`);

    // Count by status
    const approvedCount = await prisma.feedback.count({ where: { status: 'APPROVED' } });
    const pendingCount = await prisma.feedback.count({ where: { status: 'PENDING' } });
    const rejectedCount = await prisma.feedback.count({ where: { status: 'REJECTED' } });

    console.log(`✅ Approved: ${approvedCount}`);
    console.log(`⏳ Pending: ${pendingCount}`);
    console.log(`❌ Rejected: ${rejectedCount}`);

    // Show recent feedback
    console.log('\n📝 Recent Feedback:');
    const recentFeedback = await prisma.feedback.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        rating: true,
        status: true,
        message: true,
        createdAt: true
      }
    });

    if (recentFeedback.length === 0) {
      console.log('No feedback found.');
    } else {
      recentFeedback.forEach((feedback, index) => {
        console.log(`\n${index + 1}. ${feedback.name} (${feedback.email})`);
        console.log(`   Rating: ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)} (${feedback.rating}/5)`);
        console.log(`   Status: ${feedback.status}`);
        console.log(`   Message: "${feedback.message.substring(0, 80)}${feedback.message.length > 80 ? '...' : ''}"`);
        console.log(`   Date: ${feedback.createdAt.toLocaleDateString()}`);
      });
    }

    // Show table structure
    console.log('\n🏗️  Database Table Structure:');
    console.log('Table: feedbacks');
    console.log('Columns: id, name, email, message, rating, userId, status, createdAt, updatedAt');

  } catch (error) {
    console.error('❌ Error checking feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeedback();
