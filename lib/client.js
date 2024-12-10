import * as baileys from 'baileys';
import config from '../config.js';
import Message from './Base.js';
import useSequelizeAuthState from './Auth.js';
import { commands, Plugins } from './plugins.js';
import { loadMessage, saveMessage } from '../sql/store.js';
import { manageProcess } from './utils.js';
import { AntiDelete } from './utils/antidelete.js';
import { GroupParticipants } from './utils/groups.js';
import { schedules } from './utils/schedule.js';
import { handleUpserts } from './upserts.js';
import { smsg } from './message.js';
import { isLatest } from './updater.js';

const logger = { level: 'silent', log: () => {}, info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {}, child: () => logger };

const connect = async () => {
	const session = await useSequelizeAuthState(config.SESSION_ID, logger);
	const { state, saveCreds } = session;
	const { version } = await baileys.fetchLatestBaileysVersion();

	const conn = baileys.makeWASocket({
		auth: {
			creds: state.creds,
			keys: baileys.makeCacheableSignalKeyStore(state.keys, logger /**cache*/),
		},
		printQRInTerminal: true,
		logger,
		browser: baileys.Browsers.windows('Chrome'),
		version,
		keepAliveIntervalMs: 5000,
		syncFullHistory: false,
		markOnlineOnConnect: false,
		fireInitQueries: false,
		emitOwnEvents: true,
		getMessage: async key => {
			const store = await loadMessage(key.id);
			if (store) return store;
			return { conversation: null };
		},
	});

	conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			lastDisconnect.error?.output?.statusCode !== baileys.DisconnectReason.loggedOut ? connect() : manageProcess();
		} else if (connection === 'open') {
			let status = `XSTRO BOT ${config.VERSION}
PREFIX: ${config.PREFIX}
PLUGINS: ${commands.length}
MODE: ${config.MODE}

CONFIGURATIONS
READ_CMDS: ${config.READ_CMD}
AUTO_READ: ${config.AUTO_READ}
READ_STATUS: ${config.AUTO_STATUS_READ}
TIME_ZONE: ${config.TIME_ZONE}`;

			if (!(await isLatest())) status += `\n\nBot isn't on Latest Version.\nUse ${config.PREFIX}update now`;
			await conn.sendMessage(conn.user.id, { text: '```' + status + '```' });
			console.log(`Connected\n${status}`);
		} else if (connection === 'connecting') {
			console.log('Connecting...');
		}
	});

	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type === 'notify') {
			const msg = await smsg(JSON.parse(JSON.stringify(messages[0])), conn);
			await Plugins(msg, conn, new Message(conn, msg));
			await saveMessage(msg, msg.pushName);
			await handleUpserts(conn, msg, new Message(conn, msg));
			if (config.AUTO_READ) await conn.readMessages([msg.key]);
			if (config.AUTO_STATUS_READ && msg.remoteJid === 'status@broadcast') await conn.readMessages([msg.key]);
		}
	});

	conn.ev.on('messages.update', async updates => {
		await AntiDelete(conn, updates);
	});

	GroupParticipants(conn);
	schedules(conn);
	return conn;
};

export default connect;
