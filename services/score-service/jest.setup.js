import mongoose from 'mongoose';

// Wacht tot MongoDB klaar is voordat tests beginnen
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Cleanup na elke test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Sluit connectie na alle tests
afterAll(async () => {
  await mongoose.connection.close();
}); 