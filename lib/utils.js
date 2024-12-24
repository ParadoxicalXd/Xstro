import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import { jidNormalizedUser } from 'baileys';

export function manageProcess(type) {
	return exec(type === 'restart' ? 'npm start' : 'npm stop');
}

export function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function runtime(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor((seconds % (3600 * 24)) / 3600);
	var m = Math.floor((seconds % 3600) / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? ' d ' : ' d ') : '';
	var hDisplay = h > 0 ? h + (h == 1 ? ' h ' : ' h ') : '';
	var mDisplay = m > 0 ? m + (m == 1 ? ' m ' : ' m ') : '';
	var sDisplay = s > 0 ? s + (s == 1 ? ' s' : ' s') : '';
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

export const getFloor = number => {
	return Math.floor(number);
};

export const getRandom = array => {
	if (array.length === 0) return undefined;
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
};

export const numtoId = phoneNumber => {
	if (!phoneNumber || typeof phoneNumber !== 'string')
		phoneNumber = phoneNumber.toString();
	return jidNormalizedUser(
		`${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`,
	);
};

export const bufferToJSON = obj => {
	if (Buffer.isBuffer(obj)) return { type: 'Buffer', data: Array.from(obj) };
	if (Array.isArray(obj)) return obj.map(bufferToJSON);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key,
				bufferToJSON(value),
			]),
		);
	}
	return obj;
};

export const jsonToBuffer = obj => {
	if (obj?.type === 'Buffer' && Array.isArray(obj.data))
		return Buffer.from(obj.data);
	if (Array.isArray(obj)) return obj.map(jsonToBuffer);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key,
				jsonToBuffer(value),
			]),
		);
	}
	return obj;
};

export const profile = async (name, fn, logger) => {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	logger.debug(`${name} took ${(end - start).toFixed(2)} ms`);
	return result;
};
