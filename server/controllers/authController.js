const { admin, db } = require('../firebase');

const register = async (req, res) => {
    const { name, email, username, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({ email, password });

        await db.collection('users').doc(userRecord.uid).set({
            name,
            email,
            username
        });

        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const doc = await db.collection('users').doc(req.user.uid).get()
        if (!doc.exists) return res.status(404).json({ error: 'User not found' })
        res.status(200).json({ id: doc.id, ...doc.data() })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { register, getMe }