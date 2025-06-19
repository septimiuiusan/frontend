const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkReservations() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    console.log('Reservations in database:', JSON.stringify(reservations, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReservations();
