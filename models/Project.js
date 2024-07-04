const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    projectTitle: { type: String, required: true },
    image: { type: String },
    about: { type: String, required: true },
    projectLink: { type: String, required: true },
    videoLink: { type: String, required: true },
    supervisor: { type: String, required: true },
    teamMembers: { type: [String], required: true },
    university: { type: String, required: true },
    dept: { type: String, required: true },
    uploadDate: { type: Date, required: true, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
