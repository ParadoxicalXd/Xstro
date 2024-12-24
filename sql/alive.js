import { DataTypes } from 'sequelize';
import config from '#config';
import { runtime } from '#lib';
import { DATABASE } from '#lib';

const AliveDB = DATABASE.define(
	'AliveDB',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'alive',
		timestamps: false,
	},
);

/**
 * Retrieves the alive message from the database or returns a default message.
 * @async
 * @function getAliveMsg
 * @returns {Promise<string>} The alive message. If no message is found in the database,
 * returns a default message including the bot info.
 */
const getAliveMsg = async () => {
	const msg = await AliveDB.findOne();
	return msg?.message || `@user ${config.BOT_INFO.split(';')[1]} is alive`;
};

/**
 * Updates the alive message in the database by removing all existing messages and creating a new one.
 * @async
 * @param {string} text - The new alive message to be stored in the database.
 * @returns {Promise<boolean>} Returns true when the operation is completed successfully.
 * @throws {Error} If database operations fail.
 */
const setAliveMsg = async text => {
	await AliveDB.destroy({ where: {} });
	await AliveDB.create({ message: text });
	return true;
};

/**
 * Processes and replaces placeholders in an alive message with dynamic content.
 * @async
 * @param {Object} message - The message object containing user information.
 * @param {string} message.pushName - The push name of the user.
 * @param {string} message.sender - The sender's ID in the format 'number@domain'.
 * @returns {Promise<string>} The processed message with all placeholders replaced.
 * @description Replaces the following placeholders:
 * - &runtime: Current runtime duration
 * - &user: User's push name or 'user'
 * - @user: User's formatted ID
 * - &quotes: Random quote from quote service
 * - &facts: Random fact from fact service
 * - &owner: Bot owner name from config
 * - &botname: Bot name from config
 */
const aliveMessage = async message => {
	const msg = await getAliveMsg();

	return msg
		.replace(/&runtime/g, runtime(process.uptime()))
		.replace(/&user/g, message.pushName || 'user')
		.replace(/@user/g, `@${message.sender.split('@')[0]}`)
		.replace(/&owner/g, config.BOT_INFO.split(';')[0])
		.replace(/&botname/g, config.BOT_INFO.split(';')[1]);
};

export { AliveDB, getAliveMsg, setAliveMsg, aliveMessage };
