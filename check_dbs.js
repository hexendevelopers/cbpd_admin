const mongoose = require('mongoose');

const MONGO_URI = "mongodb://hexenwebcreators:swalihpalakkad@ac-pz8le2d-shard-00-00.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-01.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-02.jcbsfsq.mongodb.net:27017/?ssl=true&replicaSet=atlas-144nus-shard-0&authSource=admin&retryWrites=true&w=majority";

async function checkDatabases() {
  try {
    await mongoose.connect(MONGO_URI);
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    
    console.log("Databases on cluster:");
    for (const dbInfo of result.databases) {
      console.log(`- ${dbInfo.name}`);
      // If it's not admin/local, check organizations
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local' && dbInfo.name !== 'config') {
        const db = mongoose.connection.client.db(dbInfo.name);
        const orgsCount = await db.collection('organizations').countDocuments();
        console.log(`  -> organizations count: ${orgsCount}`);
        
        if (orgsCount > 0) {
          const user = await db.collection('organizations').findOne({ email: "muhammedjasir908@gmail.com" });
          if (user) {
            console.log(`  -> FOUND USER in db: ${dbInfo.name}`);
          }
        }
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabases();
