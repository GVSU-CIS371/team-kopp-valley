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

module.exports = { register };