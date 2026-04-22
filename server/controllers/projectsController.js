const { db } = require('../firebase')

const createProject = async function (req, res) {
    const { title, content, tags, links } = req.body;
    const uid = req.user.uid;

    try {
        const projectRef = await db.collection('projects').add({
            title,
            content,
            tags,
            status: 'draft',
            links: links || [],
            userId: uid,
            createdAt: new Date()
        });
        res.status(201).json({ message: 'Project created successfully', projectId: projectRef.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getProjects = async function (req, res) {
    try {
        const snapshot = await db.collection('projects')
            .where('status', '==', 'published')
            .get();

        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getProject = async (req, res) => {
    try {
        const doc = await db.collection('projects').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createProject, getProjects, getProject };