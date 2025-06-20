import sequelize from '../config/db.js';
import { Sequelize } from 'sequelize';

export default sequelize.define('polls', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    link: { type: Sequelize.STRING, unique: true },
    id_user: {
        type: Sequelize.BIGINT,
        references: { model: 'users', key: 'id' }
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
});
