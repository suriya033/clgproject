const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    targetRoles: [{
        type: String,
        enum: ['All', 'Student', 'Staff', 'HOD']
    }],
    attachmentUrl: {
        type: String
    },
    attachmentType: {
        type: String,
        enum: ['image', 'pdf', 'document', 'other']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    department: {
        type: String,
        default: 'All'
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
