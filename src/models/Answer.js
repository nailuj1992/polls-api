import sequelize from '../config/db.js';
import { Sequelize } from 'sequelize';

export default sequelize.define('answers', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    content: Sequelize.TEXT,
    id_user_answered: {
        type: Sequelize.BIGINT,
        references: { model: 'users', key: 'id' }
    },
    id_question: {
        type: Sequelize.INTEGER,
        references: { model: 'questions', key: 'id' }
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
});
