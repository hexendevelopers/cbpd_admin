import mongoose from 'mongoose';
import Organization from './src/models/institutionModel';
import connectToDB from './src/configs/mongodb';
async function check() {
  await connectToDB();
  const insts = await Organization.find({ resetPasswordToken: { $ne: null } });
  console.log(insts.map(i => ({ email: i.email, isApproved: i.isApproved, token: i.resetPasswordToken })));
  process.exit(0);
}
check();
