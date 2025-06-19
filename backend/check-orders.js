const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total orders found: ${orders.length}`);
    console.log('Most recent 5 orders:');
    console.log(JSON.stringify(orders.slice(0, 5), null, 2));
    
    if (orders.length === 0) {
      console.log('No orders found in the database.');
    }
    
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
