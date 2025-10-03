const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...');

  // 1. Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Beverages' },
      { name: 'Snacks' },
      { name: 'Dairy' },
    ],
    skipDuplicates: true,
  });

  // 2. MenuItems
  const menuItemsData = [
    { name: 'Coke', price: 35, categoryId: 1 },
    { name: 'Pepsi', price: 35, categoryId: 1 },
    { name: 'Chips', price: 25, categoryId: 2 },
    { name: 'Cheese Sandwich', price: 50, categoryId: 2 },
    { name: 'Milk', price: 40, categoryId: 3 },
    { name: 'Yogurt', price: 45, categoryId: 3 },
  ];

  await prisma.menuItem.createMany({
    data: menuItemsData,
    skipDuplicates: true,
  });

  // 3. InventoryLogs
  const inventoryLogsData = [
    { itemName: 'Coke', quantity: 50, changeType: 'INCREASE' },
    { itemName: 'Chips', quantity: 30, changeType: 'INCREASE' },
    { itemName: 'Milk', quantity: 20, changeType: 'INCREASE' },
    { itemName: 'Yogurt', quantity: 15, changeType: 'INCREASE' },
  ];
  await prisma.inventoryLog.createMany({ data: inventoryLogsData });

  // 4. Orders
  const orders = await prisma.order.createMany({
    data: [
      { tableNumber: 1, status: 'PENDING' },
      { tableNumber: 2, status: 'COMPLETED' },
      { tableNumber: 3, status: 'CANCELLED' },
    ],
    skipDuplicates: true,
  });

  // Since we need IDs for order items, let's fetch them
  const allOrders = await prisma.order.findMany();
  const allMenuItems = await prisma.menuItem.findMany();

  // 5. OrderItems
  const orderItemsData = [
    {
      orderId: allOrders[0].id,
      menuItemId: allMenuItems[0].id, // Coke
      quantity: 2,
    },
    {
      orderId: allOrders[0].id,
      menuItemId: allMenuItems[2].id, // Chips
      quantity: 1,
    },
    {
      orderId: allOrders[1].id,
      menuItemId: allMenuItems[1].id, // Pepsi
      quantity: 3,
    },
    {
      orderId: allOrders[1].id,
      menuItemId: allMenuItems[4].id, // Milk
      quantity: 1,
    },
  ];

  await prisma.orderItem.createMany({ data: orderItemsData });

  // 6. Payments
  const paymentsData = [
    {
      orderId: allOrders[1].id,
      amount: 140,
      method: 'CASH',
      transactionRef: null,
    },
    {
      orderId: allOrders[1].id,
      amount: 20,
      method: 'MOBILE_BANKING',
      transactionRef: 'TX123456',
    },
  ];
  await prisma.payment.createMany({ data: paymentsData });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
