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
			const status = `XSTRO BOT ${config.VERSION}\nPREFIX: ${config.PREFIX}\nPLUGINS: ${commands.length}\nMODE: ${config.MODE}\n\nCONFIGURATIONS\nREAD_CMDS: ${config.READ_CMD}\nAUTO_READ: ${config.AUTO_READ}\nREAD_STATUS: ${config.AUTO_STATUS_READ}\nTIME_ZONE: ${config.TIME_ZONE}`;
			await conn.sendMessage(conn.user.id, { text: '```' + status + '```' });
			console.log(`Connected\n${status}`);
		} else if (connection === 'connecting') {
			console.log('Connecting...');
		}
	});

	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		const msg = await smsg(JSON.parse(JSON.stringify(messages[0])), conn);
		const ev = new Message(conn, msg);
		if (type === 'notify') {
			await Plugins(msg, conn, ev);
			await saveMessage(msg, msg.pushName);
			await handleUpserts(conn, msg, ev);
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
