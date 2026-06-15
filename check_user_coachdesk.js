const mongoose = require('mongoose');

const MONGO_URI = "mongodb://hexenwebcreators:swalihpalakkad@ac-pz8le2d-shard-00-00.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-01.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-02.jcbsfsq.mongodb.net:27017/coachdesk?ssl=true&replicaSet=atlas-144nus-shard-0&authSource=admin&retryWrites=true&w=majority";

async function checkUserStatus() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    const user = await db.collection('organizations').findOne({ email: "muhammedjasir908@gmail.com" });
    if (user) {
      console.log(`- isApproved: ${user.isApproved}`);
      console.log(`- isTerminated: ${user.isTerminated}`);
      console.log(`- emailAddress: ${user.emailAddress}`);
    } else {
      console.log("Not found in coachdesk.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserStatus();
