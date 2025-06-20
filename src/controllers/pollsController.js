import index from '../models/index.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

export const createPoll = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { title, description, username, questions } = req.body;

        if (!title || !username || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUsername = await index.User.findOne({ where: { username } });
        if (!existingUsername) {
            return res.status(400).json({ message: 'Username does not exist' });
        }

        const newPoll = await index.Poll.create({
            title,
            description,
            link: Math.random().toString(36).substring(2, 10),
            id_user: existingUsername.id
        }, { transaction: t });
        const questionsAdded = [];

        for (const question of questions) {
            const { text, typeField } = question;
            if (!text || !typeField) {
                await t.rollback();
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const validTypeField = await index.QuestionType.findOne({ where: { code: typeField } });
            if (!validTypeField) {
                await t.rollback();
                return res.status(400).json({ message: 'Invalid type field' });
            }

            questionsAdded.push(await index.Question.create({
                text,
                type_field: validTypeField.id,
                id_poll: newPoll.id
            }, { transaction: t }));
        }

        await t.commit();
        res.status(201).json({ message: 'Poll created successfully', poll: newPoll, questions: questionsAdded });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: `Error creating poll: ${error}` });
    }
};

export const getPollsByUser = async (req, res) => {
    try {
        const { username } = req.params;

        const existingUsername = await index.User.findOne({ where: { username } });
        if (!existingUsername) {
            return res.status(400).json({ message: 'Username does not exist' });
        }

        const polls = await index.Poll.findAll({
            where: { id_user: existingUsername.id },
            attributes: ['id', 'title', 'description', 'link']
        });

        res.status(200).json(polls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error getting polls: ${error}` });
    }
};

export const getPollByLink = async (req, res) => {
    try {
        const { link } = req.params;
        const poll = await index.Poll.findOne({
            where: { link },
            attributes: ['id', 'title', 'description', 'link']
        });
        if (!poll) return res.status(404).json({ error: 'Poll not found' });

        const questions = [];
        let questionsDB = await index.Question.findAll({
            where: { id_poll: poll.id },
            attributes: ['id', 'text', 'type_field']
        });
        if (!questionsDB) questionsDB = [];

        for (const questionDB of questionsDB) {
            const questionType = await index.QuestionType.findOne({ where: { id: questionDB.type_field } });
            if (!questionType) {
                return res.status(500).json({ error: 'Error getting question type' });
            }
            questions.push({
                id: questionDB.id,
                text: questionDB.text,
                typeField: {
                    id: questionType.id,
                    code: questionType.code,
                    description: questionType.description
                }
            });
        }

        const result = {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            link: poll.link,
            questions: questions
        };
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error getting poll: ${error}` });
    }
};

export const answerPoll = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { link } = req.params;
        const { answers, username = null } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let idUser = null;
        if (username) {
            const existingUsername = await index.User.findOne({ where: { username: username } });
            if (!existingUsername) {
                return res.status(400).json({ message: 'Username does not exist' });
            }
            idUser = existingUsername.id;
        }

        const poll = await index.Poll.findOne({ where: { link } });
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const questions = await index.Question.findAll({ where: { id_poll: poll.id } });
        if (!questions || answers.length !== questions.length) {
            return res.status(400).json({ message: 'Number of answers does not match number of questions' });
        }

        let answeredQuestions = 0;
        for (const answer of answers) {
            const { idQuestion, content } = answer;

            const questionBelongs = questions.find(question => question.id == idQuestion);
            if (!questionBelongs) {
                await t.rollback();
                return res.status(400).json({ message: `Question ${idQuestion} does not belong to the poll` });
            }

            await index.Answer.create({
                content,
                id_user_answered: idUser,
                id_question: questionBelongs.id
            }, { transaction: t });
            answeredQuestions++;
        }

        await t.commit();
        res.status(201).json({ message: !username ? 'Poll answered successfully' : `Poll answered successfully by ${username}`, questionsAnswered: answeredQuestions });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: `Error answering poll: ${error}` });
    }
};

export const editPoll = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { link } = req.params;
        const { title, description, username, questions } = req.body;

        if (!title || !username || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const poll = await index.Poll.findOne({ where: { link } });
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const existingUsername = await index.User.findOne({ where: { username } });
        if (!existingUsername) {
            return res.status(400).json({ message: 'Username does not exist' });
        }

        if (poll.id_user != existingUsername.id) {
            return res.status(403).json({ message: 'You are not the owner of the poll' });
        }

        await index.Poll.update({
            id: poll.id,
            title,
            description,
            link: link,
            id_user: existingUsername.id
        }, { where: { link }, transaction: t });

        const questionsDB = await index.Question.findAll({ where: { id_poll: poll.id } });
        for (const questionDB of questionsDB) {
            const answeredQuestions = await index.Answer.findAll({ where: { id_question: questionDB.id } });
            if (answeredQuestions && answeredQuestions.length > 0) {
                await t.rollback();
                return res.status(400).json({ message: 'This poll cannot be edited because it has already been answered' });
            }
        }
        await index.Question.destroy({ where: { id_poll: poll.id } }, { transaction: t });

        const questionsAdded = [];
        for (const question of questions) {
            const { text, typeField } = question;
            if (!text || !typeField) {
                await t.rollback();
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const validTypeField = await index.QuestionType.findOne({ where: { code: typeField } });
            if (!validTypeField) {
                await t.rollback();
                return res.status(400).json({ message: 'Invalid type field' });
            }

            questionsAdded.push(await index.Question.create({
                text,
                type_field: validTypeField.id,
                id_poll: poll.id
            }, { transaction: t }));
        }

        await t.commit();
        res.status(201).json({ message: 'Poll modified successfully', poll: poll, questions: questionsAdded });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: `Error editing poll: ${error}` });
    }
};

export const deletePoll = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { link } = req.params;
        const { username } = req.body;

        const poll = await index.Poll.findOne({ where: { link } });
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const existingUsername = await index.User.findOne({ where: { username } });
        if (!existingUsername) {
            return res.status(400).json({ message: 'Username does not exist' });
        }

        if (poll.id_user != existingUsername.id) {
            return res.status(403).json({ message: 'You are not the owner of the poll' });
        }

        const questionsDB = await index.Question.findAll({ where: { id_poll: poll.id } });
        for (const questionDB of questionsDB) {
            const answeredQuestions = await index.Answer.findAll({ where: { id_question: questionDB.id } });
            if (answeredQuestions && answeredQuestions.length > 0) {
                await t.rollback();
                return res.status(400).json({ message: 'This poll cannot be deleted because it has already been answered' });
            }
        }

        await index.Poll.destroy({ where: { link }, transaction: t });
        await t.commit();
        res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: `Error deleting poll: ${error}` });
    }
};

export const getPollAnswers = async (req, res) => {
    try {
        const { link, username } = req.params;

        if (!link || !username) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const poll = await index.Poll.findOne({ where: { link } });
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const existingUsername = await index.User.findOne({ where: { username } });
        if (!existingUsername) {
            return res.status(400).json({ message: 'Username does not exist' });
        }

        if (poll.id_user != existingUsername.id) {
            return res.status(403).json({ message: 'You are not the owner of the poll' });
        }

        const questions = await index.Question.findAll({ where: { id_poll: poll.id } });
        const answers = await index.Answer.findAll({ where: { id_question: { [Op.in]: questions.map(question => question.id) } } });

        const fullAnswers = questions.map(question => {
            const answersQuestion = answers.filter(answer => answer.id_question == question.id);
            return {
                question: {
                    id: question.id,
                    text: question.text,
                    type: question.type_field
                },
                answers: answersQuestion
            };
        });

        res.status(200).json({
            poll: {
                id: poll.id,
                title: poll.title,
                description: poll.description
            },
            answers: fullAnswers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error getting poll answers: ${error}` });
    }
};