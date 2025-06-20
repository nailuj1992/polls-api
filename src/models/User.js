import sequelize from '../config/db.js';
import { Sequelize } from 'sequelize';

export default sequelize.define('users', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
    username: { type: Sequelize.STRING, unique: true },
    email: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
});