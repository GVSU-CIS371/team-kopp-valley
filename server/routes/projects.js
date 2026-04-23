const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { createProject, getProjects, getProject, getUserProjects, deleteProject, updateProject} = require('../controllers/projectsController');

router.get('/', getProjects);
router.get('/me', verifyToken, getUserProjects);
router.get('/:id', getProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);
router.post('/', verifyToken, createProject);

module.exports = router;