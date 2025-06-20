import sequelize from '../config/db.js';
import { Sequelize } from 'sequelize';

export default sequelize.define('questions', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    type_field: {
        type: Sequelize.BIGINT,
        references: { model: 'question_types', key: 'id' }
    },
    text: Sequelize.TEXT,
    id_poll: {
        type: Sequelize.INTEGER,
        references: { model: 'polls', key: 'id' }
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
});
