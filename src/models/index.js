import sequelize from '../config/db.js';

import User from './User.js';
import Poll from './Poll.js';
import QuestionType from './QuestionType.js';
import Question from './Question.js';
import Answer from './Answer.js';

User.hasMany(Poll, { foreignKey: 'id_user' });
Poll.belongsTo(User, { foreignKey: 'id_user' });

Poll.hasMany(Question, { foreignKey: 'id_poll' });
Question.belongsTo(Poll, { foreignKey: 'id_poll' });

QuestionType.hasMany(Question, { foreignKey: 'type_field' });
Question.belongsTo(QuestionType, { foreignKey: 'type_field' });

User.hasMany(Answer, { foreignKey: 'id_user_answered' });
Answer.belongsTo(User, { foreignKey: 'id_user_answered' });

Question.hasMany(Answer, { foreignKey: 'id_question' });
Answer.belongsTo(Question, { foreignKey: 'id_question' });

export default {
    sequelize,
    User,
    Poll,
    QuestionType,
    Question,
    Answer
};