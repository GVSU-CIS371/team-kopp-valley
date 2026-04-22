const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { createProject, getProjects, getProject} = require('../controllers/projectsController');

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', verifyToken, createProject);

module.exports = router;