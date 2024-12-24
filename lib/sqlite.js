import proto, { initAuthCreds } from 'baileys';
import { AuthState } from '#sql';
import { jsonToBuffer, bufferToJSON, profile } from './utils.js';

const SequelizeAuthState = async (sessionId, logger) => {
	const writeData = async (key, data) => {
		const serialized = JSON.stringify(bufferToJSON(data));
		await AuthState.upsert({ session_id: sessionId, data_key: key, data_value: serialized });
	};

	const readData = async key => {
		const record = await AuthState.findOne({ where: { session_id: sessionId, data_key: key } });
		return record ? jsonToBuffer(JSON.parse(record.data_value)) : null;
	};

	const creds = (await profile('readCreds', () => readData('creds'), logger)) || initAuthCreds();

	const state = {
		creds,
		keys: {
			get: async (type, ids) => {
				return profile(
					'keys.get',
					async () => {
						const keys = ids.map(id => `${type}-${id}`);
						const records = await AuthState.findAll({
							where: { session_id: sessionId, data_key: keys },
						});
						return records.reduce((acc, record) => {
							const id = record.data_key.split('-')[1];
							let value = jsonToBuffer(JSON.parse(record.data_value));
							if (type === 'app-state-sync-key') value = proto?.Message?.AppStateSyncKeyData?.fromObject(value);
							acc[id] = value;
							return acc;
						}, {});
					},
					logger,
				);
			},
			set: async data => {
				return profile(
					'keys.set',
					async () => {
						const entries = [];
						for (const [type, ids] of Object.entries(data)) {
							for (const [id, value] of Object.entries(ids || {})) {
								entries.push({
									session_id: sessionId,
									data_key: `${type}-${id}`,
									data_value: JSON.stringify(bufferToJSON(value)),
								});
							}
						}
						await AuthState.bulkCreate(entries, { updateOnDuplicate: ['data_value'] });
					},
					logger,
				);
			},
		},
	};

	return {
		state,
		saveCreds: () => profile('saveCreds', () => writeData('creds', state.creds), logger),
		deleteSession: () => profile('deleteSession', () => AuthState.destroy({ where: { session_id: sessionId } }), logger),
	};
};

export default SequelizeAuthState;
