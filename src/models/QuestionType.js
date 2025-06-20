import sequelize from '../config/db.js';
import { Sequelize } from 'sequelize';

export default sequelize.define('question_types', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    code: { type: Sequelize.STRING, unique: true },
    description: Sequelize.TEXT
});
