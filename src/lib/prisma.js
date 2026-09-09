const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

// Prisma/PostgreSQL is used whenever DATABASE_URL is configured. The in-memory
// adapter makes the demo immediately usable without committing credentials or
// requiring a local database; its data resets when the server restarts.
function createDemoStore() {
  const users = [];
  const listings = [];
  const seller = (user) => ({ id: user.id, name: user.name, college: user.college });
  const decorate = (listing) => ({ ...listing, seller: seller(users.find((user) => user.id === listing.sellerId)) });
  const demoUser = { id: 'demo-seller', name: 'Aarav Sharma', email: 'aarav@campus.test', passwordHash: '$2b$12$hNQmnk/O9EgF9EOWAcnZZ.7.zZxgC2M7.2R8hKDIoS.C.zdhWoOeK', college: 'Delhi Technological University', createdAt: new Date() };
  users.push(demoUser);
  [['Operating Systems — Galvin', 'Books', 350, '📘'], ['ThinkPad X1 Carbon', 'Electronics', 48000, '💻'], ['Wooden study desk', 'Furniture', 1800, '🪑'], ['PS5 controller', 'Gaming', 3200, '🎮']].forEach(([title, category, price, emoji], index) => listings.push({ id: `demo-${index}`, title, category, price, emoji, condition: 'Good', description: `${title}, carefully used and available for campus pickup.`, status: 'ACTIVE', sellerId: demoUser.id, createdAt: new Date(Date.now() - index * 3600000), updatedAt: new Date() }));
  return {
    user: {
      findUnique: async ({ where }) => users.find((user) => Object.entries(where).every(([key, value]) => user[key] === value)) || null,
      create: async ({ data }) => { const user = { id: randomUUID(), createdAt: new Date(), ...data }; users.push(user); return user; }
    },
    listing: {
      findMany: async ({ where = {}, orderBy, take }) => {
        let result = listings.filter((listing) => {
          if (where.status && listing.status !== where.status) return false;
          if (where.category && listing.category !== where.category) return false;
          if (where.sellerId && listing.sellerId !== where.sellerId) return false;
          if (where.seller?.college && users.find((user) => user.id === listing.sellerId)?.college !== where.seller.college) return false;
          if (where.OR) return where.OR.some((rule) => Object.entries(rule).some(([key, check]) => listing[key].toLowerCase().includes(check.contains.toLowerCase())));
          return true;
        });
        if (orderBy?.createdAt === 'desc') result = result.sort((a, b) => b.createdAt - a.createdAt);
        return result.slice(0, take || result.length).map(decorate);
      },
      findUnique: async ({ where }) => listings.find((listing) => listing.id === where.id) || null,
      create: async ({ data }) => { const listing = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), status: 'ACTIVE', ...data }; listings.push(listing); return decorate(listing); },
      update: async ({ where, data }) => { const listing = listings.find((item) => item.id === where.id); Object.assign(listing, data, { updatedAt: new Date() }); return decorate(listing); }
    }
  };
}

module.exports = process.env.DATABASE_URL ? new PrismaClient() : createDemoStore();
