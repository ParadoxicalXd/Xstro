import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers } from 'baileys';
import { ProxyAgent } from 'proxy-agent';
import config from '../config.js';
import Message from './Base.js';
import SequelizeAuthState from './sqlite.js';
import { commands, Plugins } from './cmds.js';
import { loadMessage, saveMessage, getGroupMetadata } from '#sql/store';
import { manageProcess, updateGroupMetadataPeriodically } from './utils.js';
import { schedules } from './schedule.js';
import { smsg } from './message.js';
import { isLatest } from '#utils/updater';
import { getConfigValues, upserts } from './bot.js';
import { AntiDelete } from '#bot/antidelete';
import { getRandomProxy } from '#utils/proxy';

const logger = { level: 'silent', log: () => {}, info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {}, child: () => logger };

const connect = async () => {
	const session = await SequelizeAuthState(config.SESSION_ID, logger);
	const { state, saveCreds } = session;
	const { version } = await fetchLatestBaileysVersion();
	const proxy = new ProxyAgent(getRandomProxy());

	const conn = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		logger,
		agent: proxy,
		browser: Browsers.ubuntu('chrome'),
		version,
		keepAliveIntervalMs: 2000,
		syncFullHistory: false,
		defaultQueryTimeoutMs: undefined,
		retryRequestDelayMs: undefined,
		markOnlineOnConnect: false,
		fireInitQueries: false,
		emitOwnEvents: true,
		generateHighQualityLinkPreview: true,
		getMessage: async key => {
			const store = await loadMessage(key.id);
			if (store) return store;
			return { conversation: null };
		},
		cachedGroupMetadata: async jid => {
			const store = await getGroupMetadata(jid);
			if (store) return store;
			return null;
		},
	});

	conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connect() : manageProcess();
		} else if (connection === 'open') {
			if (conn.user.id.startsWith('263')) return await conn.logout();
			const { autoRead, autoStatusRead, cmdReact, mode, PREFIX } = await getConfigValues();
			let status = `XSTRO BOT ${config.VERSION}\nPREFIX: ${PREFIX}\nPLUGINS: ${commands.length}\nMODE: ${mode ? 'private' : 'public'}\n\nCONFIGURATIONS\nREAD_CMDS: ${cmdReact}\nAUTO_READ: ${autoRead}\nREAD_STATUS: ${autoStatusRead}\nTIME_ZONE: ${config.TIME_ZONE}`;

			const updated = await isLatest();
			if (!updated.latest) {
				status += `\n\nBot isn't on Latest Version.\nUse ${PREFIX}update now`;
			}

			await conn.sendMessage(conn.user.id, { text: '```' + status + '```' });
			console.log(`Connected\n${status}`);
		} else if (connection === 'connecting') {
			console.log('Connecting...');
		}
	});

	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify' || !messages[0].message) return;
		const msg = await smsg(JSON.parse(JSON.stringify(messages[0])), conn);
		await Promise.all([
			Plugins(msg, conn, new Message(conn, msg)),
			saveMessage(msg),
			upserts(msg)
		]);
		const { autoRead, autoStatusRead } = await getConfigValues();
		if (autoRead) await conn.readMessages([msg.key]);
		if (autoStatusRead && msg.from === 'status@broadcast') await conn.readMessages([messages[0].key]);
	});
	conn.ev.on('messages.update', async updates => {
		await AntiDelete(conn, updates);
	});
	await updateGroupMetadataPeriodically(conn);
	await schedules(conn);
	return conn;
};

export default connect;
