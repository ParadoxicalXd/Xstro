import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const WarnDB = DATABASE.define(
	'Warn',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		warnings: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		reason: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	},
	{
		tableName: 'warnings',
		timestamps: false,
	},
);

/**
 * Adds a warning to a user or creates a new user with one warning
 * @param {string} jid - The unique identifier of the user
 * @returns {Promise<{success: boolean, warnings: number}>} Object containing success status and current warning count
 * @async
 */
export const addWarn = async jid => {
	const [user, created] = await WarnDB.upsert(
		{ jid, warnings: 1 },
		{ returning: true }
	);
	if (!created) {
		user.warnings += 1;
		await user.save();
	}
	return { success: true, warnings: user.warnings };
};

export const getWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	return { success: true, warnings: user ? user.warnings : 0 };
};

export const resetWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	if (user) {
		user.warnings = 0;
		await user.save();
	}
	return { success: true };
};

export const isWarned = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	return user ? user.warnings > 0 : false;
};
