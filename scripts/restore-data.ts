import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreData() {
  try {
    const backupDir = path.join(__dirname, '../backup');

    // Restore Users
    const usersData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'users.json'), 'utf8'),
    );
    for (const user of usersData) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }

    // Restore Products
    const productsData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'products.json'), 'utf8'),
    );
    for (const product of productsData) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      });
    }

    // Restore Customers
    const customersData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'customers.json'), 'utf8'),
    );
    for (const customer of customersData) {
      await prisma.customer.upsert({
        where: { id: customer.id },
        update: customer,
        create: customer,
      });
    }

    // Restore Transactions
    const transactionsData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'transactions.json'), 'utf8'),
    );
    for (const transaction of transactionsData) {
      await prisma.transaction.upsert({
        where: { id: transaction.id },
        update: transaction,
        create: transaction,
      });
    }

    // Restore TransactionItems
    const transactionItemsData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'transactionItems.json'), 'utf8'),
    );
    for (const item of transactionItemsData) {
      await prisma.transactionItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }

    // Restore CashRegisters
    const cashRegistersData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'cashRegisters.json'), 'utf8'),
    );
    for (const register of cashRegistersData) {
      await prisma.cashRegister.upsert({
        where: { id: register.id },
        update: register,
        create: register,
      });
    }

    // Restore CashTransactions
    const cashTransactionsData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'cashTransactions.json'), 'utf8'),
    );
    for (const transaction of cashTransactionsData) {
      await prisma.cashTransaction.upsert({
        where: { id: transaction.id },
        update: transaction,
        create: transaction,
      });
    }

    // Restore DailyClosings
    const dailyClosingsData = JSON.parse(
      fs.readFileSync(path.join(backupDir, 'dailyClosings.json'), 'utf8'),
    );
    for (const closing of dailyClosingsData) {
      await prisma.dailyClosing.upsert({
        where: { id: closing.id },
        update: closing,
        create: closing,
      });
    }

    console.log('Restore completed successfully!');
  } catch (error) {
    console.error('Restore failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
