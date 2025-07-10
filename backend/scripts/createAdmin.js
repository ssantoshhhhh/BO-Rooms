require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  let admin = await Admin.findOne({ email });
  if (admin) {
    console.log('Admin already exists');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  admin = new Admin({ email, password: hashedPassword });
  await admin.save();
  console.log('Admin created successfully');
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 