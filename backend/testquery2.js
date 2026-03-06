require('dotenv').config();
const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({ name: String });
const Department = mongoose.model('Department', DepartmentSchema);

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected');
    const depts = await Department.find();
    console.log('Departments:', depts);
    mongoose.connection.close();
});
