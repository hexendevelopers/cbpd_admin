// scripts/fix-student-schema.js
// Run this script to fix the student schema issues

const mongoose = require('mongoose');

async function fixStudentSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coachdesk');
    console.log('Connected to MongoDB');

    // Get the students collection
    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');

    // Check if collection exists
    const collections = await db.listCollections({ name: 'students' }).toArray();
    if (collections.length === 0) {
      console.log('Students collection does not exist yet. Schema will be created fresh.');
      return;
    }

    console.log('Students collection exists. Checking for schema issues...');

    // Remove any existing validation rules that might be causing issues
    try {
      await db.command({
        collMod: 'students',
        validator: {},
        validationLevel: 'off'
      });
      console.log('Removed existing validation rules');
    } catch (error) {
      console.log('No existing validation rules to remove');
    }

    // Update existing documents to remove govtIdNumber field if it exists
    const updateResult = await studentsCollection.updateMany(
      { govtIdNumber: { $exists: true } },
      { $unset: { govtIdNumber: "" } }
    );
    console.log(`Removed govtIdNumber from ${updateResult.modifiedCount} documents`);

    // Update existing documents to ensure passportPhoto and marksheets have default values
    const updateResult2 = await studentsCollection.updateMany(
      { passportPhoto: { $exists: false } },
      { $set: { passportPhoto: "" } }
    );
    console.log(`Set default passportPhoto for ${updateResult2.modifiedCount} documents`);

    const updateResult3 = await studentsCollection.updateMany(
      { marksheets: { $exists: false } },
      { $set: { marksheets: [] } }
    );
    console.log(`Set default marksheets for ${updateResult3.modifiedCount} documents`);

    // Drop and recreate indexes to ensure they match the new schema
    try {
      await studentsCollection.dropIndex('govtIdNumber_1');
      console.log('Dropped govtIdNumber index');
    } catch (error) {
      console.log('govtIdNumber index did not exist');
    }

    // Recreate the correct indexes
    await studentsCollection.createIndex({ admissionNumber: 1 }, { unique: true });
    await studentsCollection.createIndex({ fullName: "text" });
    await studentsCollection.createIndex({ isActive: 1 });
    await studentsCollection.createIndex({ institutionId: 1 });
    console.log('Recreated indexes');

    console.log('Schema fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing schema:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixStudentSchema();