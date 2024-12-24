import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const AutoKickDB = DATABASE.define(
	'AutoKick',
	{
		groupJid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		userJid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['groupJid', 'userJid'],
			},
		],
		tableName: 'autokick',
		timestamps: false,
	},
);

/**
 * Adds a user to the AutoKick list.
 * @param {string} groupJid - Group's JID.
 * @param {string} userJid - User's JID.
 * @returns {Promise<boolean>} - True if added successfully, false if already exists.
 */
export const addAKick = async (groupJid, userJid) => {
	await AutoKickDB.create({ groupJid, userJid });
	return true;
};

/**
 * Deletes a user from the AutoKick list.
 * @param {string} groupJid - Group's JID.
 * @param {string} userJid - User's JID.
 * @returns {Promise<number>} - The number of rows deleted.
 */
export const delKick = async (groupJid, userJid) => {
	const result = await AutoKickDB.destroy({
		where: { groupJid, userJid },
	});
	return result;
};

/**
 * Retrieves AutoKick entries for a specific group or user.
 * @param {string} groupJid - Group's JID.
 * @param {string} [userJid] - User's JID (optional).
 * @returns {Promise<Array>} - An array of kick records.
 */
export const getKicks = async (groupJid, userJid = null) => {
	const whereClause = { groupJid };
	if (userJid) whereClause.userJid = userJid;

	const kicks = await AutoKickDB.findAll({ where: whereClause });
	return kicks.map(kick => kick.get());
};