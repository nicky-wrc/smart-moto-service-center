import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStalePOs() {
  const stalePOs = await prisma.purchaseOrder.findMany({
    where: { status: 'ORDERED' },
    include: { items: true },
  });

  console.log(`Found ${stalePOs.length} stale POs. Processing...`);

  for (const po of stalePOs) {
    await prisma.$transaction(async (tx) => {
      // 1. Set to COMPLETED
      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'COMPLETED' },
      });

      // 2. Receive record
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await tx.purchaseReceive.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      });
      const receiveNo = `RCV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

      await tx.purchaseReceive.create({
        data: {
          receiveNo,
          purchaseOrderId: po.id,
          receivedById: po.approvedById || po.createdById,
          notes: 'Auto-received (retroactive fix)',
          items: {
            create: po.items.map((poItem) => ({
              purchaseOrderItemId: poItem.id,
              quantity: poItem.quantity,
              partId: poItem.partId,
            })),
          },
        },
      });

      // 3. Stock and items
      for (const poItem of po.items) {
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { receivedQuantity: poItem.quantity },
        });

        await tx.part.update({
          where: { id: poItem.partId },
          data: { stockQuantity: { increment: poItem.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            partId: poItem.partId,
            movementType: 'IN',
            quantity: poItem.quantity,
            unitPrice: poItem.unitPrice,
            reference: `PO-${po.poNo} / RCV-${receiveNo}`,
            notes: `รับสินค้าอัตโนมัติย้อนหลังจากการอนุมัติ PO ${po.poNo}`,
            createdById: po.approvedById || po.createdById,
          },
        });
      }
    });
    console.log(`Processed PO ${po.poNo}`);
  }

  console.log('Fix complete.');
}

fixStalePOs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
