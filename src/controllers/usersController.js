import index from '../models/index.js';

export const createUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUsername = await index.User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingEmail = await index.User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = await index.User.create({
            name,
            username,
            email,
            password
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error creating user: ${error}` });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await index.User.findAll({
            attributes: ['id', 'name', 'username', 'email']
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error getting users: ${error}` });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await index.User.findByPk(id, {
            attributes: ['id', 'name', 'username', 'email']
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error getting user: ${error}` });
    }
};