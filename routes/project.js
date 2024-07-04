const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// upload a project
router.post('/uploadProject', auth, async (req, res) => {
    const { projectTitle, image, about, projectLink, videoLink, supervisor, teamMembers, university, dept } = req.body;
    const id = new Date().getTime() + Math.floor(Math.random() * 1000);
    try {
        let project = await Project.findOne({ $or: [{ image: image }, { projectLink: projectLink }, { videoLink: videoLink }] });
        if (project) {
            return res.status(400).json({ message: 'Overlapping Info' });
        }

        project = new Project({ id, projectTitle, image, about, projectLink, videoLink, supervisor, teamMembers, university, dept });
        console.log(project)
        await project.save();

        res.status(201).json({ success: true, message: 'Project uploaded successfully', project });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// fetch all projects
router.get('/fetchProjects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        console.error('Fetching projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//fetch all the projects of a memeber as teamMember or supervisor
router.get('/memberProjects/:userName', auth, async (req, res) => {
    const { userName } = req.params;
    try {
        const projects = await Project.find({
            $or: [
                { supervisor: userName },
                { teamMembers: userName }
            ]
        });

        res.json({ success: true, projects });
    } catch (error) {
        console.error('Error fetching member projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


/*// Get a specific project's info
router.get('/getProjectInfo/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ id: req.params.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ success: true, project });
    } catch (error) {
        console.error('Fetching project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});*/

/*// Update a specific project
router.put('/updateProjectInfo/:id', auth, async (req, res) => {
    const updates = req.body;

    try {
        const updateProject = await Project.findOneAndUpdate(
            { id: req.params.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updateProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ success: true, project: updateProject });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});*/


//update info of a specific project
router.put('/updateProjectInfo', async (req, res) => {
    const updates = req.body;
    try {
        const updatedProject = await Project.findOneAndUpdate(
            { id: updates.id },
            { $set: updates },
            { new: true, runValidators: true }
        )

        if (!updatedProject) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, user: updatedProject });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
