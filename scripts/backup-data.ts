import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupData() {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Backup Users
    const users = await prisma.user.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'users.json'),
      JSON.stringify(users, null, 2),
    );

    // Backup Products
    const products = await prisma.product.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'products.json'),
      JSON.stringify(products, null, 2),
    );

    // Backup Customers
    const customers = await prisma.customer.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'customers.json'),
      JSON.stringify(customers, null, 2),
    );

    // Backup Transactions
    const transactions = await prisma.transaction.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'transactions.json'),
      JSON.stringify(transactions, null, 2),
    );

    // Backup TransactionItems
    const transactionItems = await prisma.transactionItem.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'transactionItems.json'),
      JSON.stringify(transactionItems, null, 2),
    );

    // Backup CashRegisters
    const cashRegisters = await prisma.cashRegister.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'cashRegisters.json'),
      JSON.stringify(cashRegisters, null, 2),
    );

    // Backup CashTransactions
    const cashTransactions = await prisma.cashTransaction.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'cashTransactions.json'),
      JSON.stringify(cashTransactions, null, 2),
    );

    // Backup DailyClosings
    const dailyClosings = await prisma.dailyClosing.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'dailyClosings.json'),
      JSON.stringify(dailyClosings, null, 2),
    );

    console.log('Backup completed successfully!');
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupData();
