import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const AuthState = DATABASE.define(
	'AuthState',
	{
		session_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		data_key: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		data_value: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		tableName: 'session',
		timestamps: false,
		indexes: [{ fields: ['session_id', 'data_key'] }],
	},
);
