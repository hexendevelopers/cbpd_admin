const mongoose = require('mongoose');

const MONGO_URI = "mongodb://hexenwebcreators:swalihpalakkad@ac-pz8le2d-shard-00-00.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-01.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-02.jcbsfsq.mongodb.net:27017/?ssl=true&replicaSet=atlas-144nus-shard-0&authSource=admin&retryWrites=true&w=majority&appName=cbpd";

async function removeOrg() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const db = mongoose.connection.db;
    const result = await db.collection('organizations').deleteOne({ email: "admin@cbpd.com" });
    
    console.log(`Successfully deleted ${result.deletedCount} dummy organization(s).`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

removeOrg();
