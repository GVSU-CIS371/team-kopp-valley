const { db } = require('../firebase')

const createProject = async function (req, res) {
    const { title, content, tags, githubUrl, demoUrl } = req.body;
    const uid = req.user.uid;

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        const projectRef = await db.collection('projects').add({
            title,
            content,
            tags,
            status: 'draft',
            githubUrl: githubUrl || null,
            demoUrl: demoUrl || null,
            userId: uid,
            username: userData.username,
            name: userData.name,
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
            .orderBy('createdAt', 'desc')
            .get()

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

const getUserProjects = async (req, res) => {
    const uid = req.user.uid;

    try {
        const snapshot = await db.collection('projects')
            .where('userId', '==', uid)
            .get();

        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateProject = async (req, res) => {
    const { title, content, tags, githubUrl, demoUrl, status } = req.body;
    const uid = req.user.uid;

    try {
        const doc = await db.collection('projects').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (doc.data().userId !== uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await db.collection('projects').doc(req.params.id).update({
            title,
            content,
            tags,
            githubUrl: githubUrl || null,
            demoUrl: demoUrl || null,
            status
        });

        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProject = async (req, res) => {
    const uid = req.user.uid;

    try {
        const doc = await db.collection('projects').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (doc.data().userId !== uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await db.collection('projects').doc(req.params.id).delete();

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createProject, getProjects, getProject, getUserProjects, updateProject, deleteProject };