const mongoose = require('mongoose');

const MONGO_URI = "mongodb://hexenwebcreators:swalihpalakkad@ac-pz8le2d-shard-00-00.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-01.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-02.jcbsfsq.mongodb.net:27017/?ssl=true&replicaSet=atlas-144nus-shard-0&authSource=admin&retryWrites=true&w=majority&appName=cbpd";

async function checkDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`Collection: ${coll.name} - ${count} documents`);
      if (count > 0 && count < 10) {
        const docs = await db.collection(coll.name).find({}).toArray();
        console.log(`  Sample emails:`, docs.map(d => d.email || d.emailAddress || d.username || d.name || 'no-email-or-name'));
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDB();
