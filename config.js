import dotenv from 'dotenv';
dotenv.config();
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = {
	SESSION_ID: process.env.SESSION_ID || '',
	PREFIX: process.env.PREFIX || '.',
	SUDO: process.env.SUDO || '',
	BOT_INFO: process.env.BOT_INFO || 'Astro;Xstro_Bot',
	STICKER_PACK: process.env.STICKER_PACK || 'Xstro;Md',
	HEROKU_API_KEY: process.env.HEROKU_API_KEY || '',
	HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
	MUTE_MSG: process.env.MUTE_MSG || '```Group has been muted, due to AutoMute```',
	UN_MUTE_MSG: process.env.UN_MUTE_MSG || '```Group is now unmuted, due to AutoUnMute```',
	READ_CMD: process.env.READ_CMD || false,
	AUTO_READ: process.env.AUTO_READ || false,
	AUTO_STATUS_READ: process.env.AUTO_STATUS_READ || false,
	CMD_REACT: process.env.CMD_REACT || true,
	WARN_COUNT: process.env.WARN_COUNT || 3,
	MODE: process.env.MODE || 'public',
	TIME_ZONE: process.env.TZ || process.env.TIME_ZONE || 'Africa/Lagos',
	VERSION: require('./package.json').version,
	BASE_API_URL: 'https://xstro-api-ec3ad328e76f.herokuapp.com',
};

export default config;
