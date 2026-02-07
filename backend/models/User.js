const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: [
            'Admin', 'Student', 'Staff', 'HOD', 'Transport',
            'Library', 'Hostel', 'Placement', 'Sports',
            'Office', 'ExamCell', 'Driver'
        ]
    },
    department: {
        type: String,
        default: 'General'
    },
    contact: String,
    photo: String,
    dob: Date,
    mobileNo: String,
    branch: String,
    year: String,
    semester: {
        type: String,
        default: '1'
    },
    section: {
        type: String,
        default: 'A'
    },
    residencyType: {
        type: String,
        enum: ['Day Scholar', 'Hosteller'],
        default: 'Day Scholar'
    },
    parentContact: String,
    community: String,
    address: String,
    bloodGroup: String,
    admissionType: {
        type: String,
        enum: ['Counselling', 'Management'],
        default: 'Counselling'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isCoordinator: {
        type: Boolean,
        default: false
    },
    coordinatorDetails: {
        department: String,
        semester: String,
        section: String
    }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
