import {
	Antilink,
	AntiSpammer,
	AntiViewOnce,
	AntiWord,
	AutoKick,
	Antifake,
	schedules,
	updateGroupMetadata,
} from '#bot';
import config from '#config';
import { getConfig } from '#sql';
import { getJson } from 'xstro-utils';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX } =
		db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX };
}

export async function getUsers() {
	return await getJson(`${config.API_ID}/api/users`);
}

export async function upserts(msg) {
	const tasks = [
		AntiSpammer(msg),
		AntiViewOnce(msg),
		updateGroupMetadata(msg),
	];
	if (msg.isGroup)
		tasks.push(
			Antilink(msg),
			schedules(msg),
			AntiWord(msg),
			AutoKick(msg),
		);
	Promise.all(tasks);
}
