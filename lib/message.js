import {
	getContentType,
	isJidGroup,
	jidNormalizedUser,
	normalizeMessageContent,
} from 'baileys';
import { getConfigValues } from './bot.js';

/**
 * Processes and normalizes a WhatsApp message object
 * @async
 * @param {Object} messages - The raw WhatsApp message object
 * @param {Object} conn - The WhatsApp connection client object
 * @returns {Promise<Object>} A normalized message object containing:
 *  - key: Message key information (id, fromMe, remoteJid, participant)
 *  - prefix: Command prefix from config
 *  - user: Owner's JID
 *  - from: Message origin JID
 *  - pushName: Sender's push name
 *  - sender: Sender's JID
 *  - isGroup: Boolean indicating if message is from a group
 *  - client: Connection client (hidden, accessible through getter)
 *  - send: Async function to send messages
 *  - error: Async function to handle and report errors
 *  - isAdmin: Boolean indicating if sender is admin (group only)
 *  - isBotAdmin: Boolean indicating if bot is admin (group only)
 *  - message: Normalized message content
 *  - type: Message content type
 *  - participant: Message participant
 *  - mention: Array of mentioned JIDs
 *  - viewonce: Boolean for view once messages
 *  - body: Message text content
 *  - quoted: Quoted message information (if exists)
 */
export async function smsg(messages, conn) {
	const owner = jidNormalizedUser(conn.user.id);
	const isGroup = isJidGroup(messages.key.remoteJid);
	const remoteJid = isGroup
		? messages.key.remoteJid
		: jidNormalizedUser(messages.key.remoteJid);

	const msg = {
		key: {
			id: messages.key.id,
			fromMe: messages.key.fromMe,
			remoteJid,
			participant: isGroup ? messages.key.participant : undefined,
		},
		prefix: (await getConfigValues()).PREFIX,
		user: owner,
		from: messages.key.remoteJid,
		pushName: messages.pushName,
		sender: isGroup
			? messages.key?.participant ?? ''
			: messages.key?.fromMe
			? owner ?? ''
			: jidNormalizedUser(messages.key?.remoteJid ?? ''),

		isGroup,
		client: conn, // This will be hidden but accessible through a getter
		send: async (content, options = {}) => {
			const jid = options.jid || msg.key.remoteJid;
			const Msg = await conn.sendMessage(
				jid,
				{ [options.type || 'text']: content, ...options },
				{ quoted: msg || options.quoted },
			);
			return smsg(Msg, conn);
		},
		error: async (cmd, error) => {
			await msg.send(
				`\`\`\`An Error Occured while running ${
					cmd.pattern.toString().split(/\W+/)[2]
				} command!\`\`\``,
			);
			const name =
				cmd.pattern.toString().split(/\W+/)[2] || 'UNKNOWN CMD';
			const { stack, message } = error;
			const Msg = await msg.send(
				`\`\`\`─━❲ ERROR REPORT ❳━─\n\nFROM: @${
					msg?.sender?.split('@')[0]
				}\nCMD: ${name}\nMESSAGE: ${message}\`\`\``,
				{ jid: owner, mentions: [msg.sender] },
			);
			return smsg(Msg, conn) && console.log(stack);
		},
	};

	if (isGroup) {
		const metadata = await conn.groupMetadata(remoteJid);
		const participant = messages.key.participant;
		msg.isAdmin =
			!!metadata.participants.find(p => p.id === participant)?.admin ||
			false;
		msg.isBotAdmin =
			!!metadata.participants.find(p => p.id === owner)?.admin ||
			false;
	}

	if (messages.message) {
		const normalizedMessage = normalizeMessageContent(messages.message);
		const type = getContentType(normalizedMessage);
		const getPollBody = normalizedMessage => {
			if (normalizedMessage?.pollCreationMessageV3) {
				const pollData = normalizedMessage.pollCreationMessageV3;
				return [
					pollData.name,
					...pollData.options.map(option => option.optionName),
				].join(', ');
			}
			return false;
		};
		Object.assign(msg, {
			message: normalizedMessage,
			type,
			participant: msg.key.participant || msg.key.remoteJid,
			mention:
				normalizedMessage?.[type]?.contextInfo?.mentionedJid || [],
			viewonce: normalizedMessage?.[type]?.viewOnce || false,
			body:
				normalizedMessage?.[type]?.editedMessage?.conversation ||
				normalizedMessage?.[type]?.editedMessage?.text ||
				normalizedMessage?.[type]?.editedMessage?.caption ||
				normalizedMessage?.conversation ||
				normalizedMessage?.[type]?.text ||
				normalizedMessage?.[type]?.caption ||
				getPollBody(normalizedMessage) ||
				normalizedMessage?.eventMessage?.name ||
				false,
		});
	}

	const quoted = messages.message?.[msg.type]?.contextInfo?.quotedMessage;
	if (quoted) {
		const quotedMessage = normalizeMessageContent(quoted);
		const quotedType = getContentType(quotedMessage);
		msg.quoted = {
			key: {
				id: messages.message[msg.type]?.contextInfo?.stanzaId,
				fromMe:
					messages.message[msg.type]?.contextInfo
						?.participant === owner,
				remoteJid: isGroup
					? remoteJid
					: jidNormalizedUser(
							messages.message[msg.type]?.contextInfo
								?.participant,
					  ),
				participant: isGroup
					? messages.message[msg.type]?.contextInfo?.participant
					: undefined,
			},
			message: quotedMessage,
			type: quotedType,
			viewonce: quotedMessage?.[quotedType]?.viewOnce || false,
			body:
				quotedMessage?.conversation ||
				quotedMessage?.[quotedType]?.text ||
				quotedMessage?.[quotedType]?.caption ||
				false,
		};
	} else {
		msg.quoted = false;
	}
	Object.defineProperty(msg, 'client', {
		get: function () {
			return conn; // Return conn when msg.client is accessed
		},
		enumerable: false, // Hide `client` property
		configurable: false, // Prevent reassignment of getter
	});

	return msg;
}
