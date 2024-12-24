import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const AfkDB = DATABASE.define(
	'Afk',
	{
		message: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		timestamp: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
	},
	{
		tableName: 'afk',
		timestamps: false,
	},
);

/**
 * Retrieves the AFK (Away From Keyboard) message and timestamp from the database
 * @async
 * @function getAfkMessage
 * @returns {Promise<{message: string, timestamp: number}|null>} Object containing the AFK message and timestamp, or null if no AFK message exists
 */
export async function getAfkMessage() {
	const result = await AfkDB.findOne();
	if (result)
		return { message: result.message, timestamp: result.timestamp };
	return null;
}

/**
 * Updates or creates an AFK message in the database
 * @param {string} afkMessage - The AFK message to be set
 * @param {number} timestamp - The timestamp when the user went AFK
 * @returns {Promise<Object>} The created/updated AFK database entry
 * @async
 */
export const setAfkMessage = async (afkMessage, timestamp) => {
	const [afk] = await AfkDB.upsert({
		id: 1,
		message: afkMessage,
		timestamp,
	});
	return afk;
};

/**
 * Deletes an AFK (Away From Keyboard) message from the database.
 * Specifically removes the record with ID 1 from the AfkDB table.
 * @async
 * @function delAfkMessage
 * @returns {Promise<void>} A promise that resolves when the deletion is complete
 * @throws {Error} If the database operation fails
 */
export const delAfkMessage = async () => {
	await AfkDB.destroy({ where: { id: 1 } });
};
