import { isJidGroup } from 'baileys';
import { loadMessage, getAnti } from '#sql';

const handleTextMessage = async (
	conn,
	msg,
	sendTo,
	notificationText,
	isGroup,
	update,
) => {
	const messageContent =
		msg.message?.conversation ||
		msg.message?.extendedTextMessage?.text ||
		'Unknown content';
	notificationText += `\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent}`;

	await conn.sendMessage(
		sendTo,
		{
			text: notificationText,
			contextInfo: {
				mentionedJid: isGroup
					? [update.key.participant, msg.key.participant]
					: [update.key.remoteJid],
			},
		},
		{ quoted: msg },
	);
};

const handleMediaMessage = async (conn, msg, sendTo) => {
	const antideletedMsg = JSON.parse(JSON.stringify(msg.message));
	const messageType = Object.keys(antideletedMsg)[0];
	if (antideletedMsg[messageType]) {
		antideletedMsg[messageType].contextInfo = {
			stanzaId: msg.key.id,
			participant: msg.sender,
			quotedMessage: msg.message,
		};
	}
	await conn.relayMessage(sendTo, antideletedMsg, {});
};

export const AntiDelete = async (conn, updates) => {
	for (const update of updates) {
		if (
			update.key &&
			(update.update.deleteMessage || update.update?.message === null)
		) {
			const store = await loadMessage(update.key.id);

			if (store && store.message) {
				const msg = store.message;
				const isGroup = isJidGroup(store.jid);
				const antiDeleteType = isGroup ? 'gc' : 'dm';
				const antiDeleteStatus = await getAnti(antiDeleteType);
				if (!antiDeleteStatus) continue;

				const deleteTime = new Date().toLocaleTimeString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
				});

				let notificationText, sendTo;
				if (isGroup) {
					const groupMetadata = await conn.groupMetadata(
						store.jid,
					);
					const groupName = groupMetadata.subject;
					const senderNumber =
						msg.key.participant?.split('@')[0];
					const deleterNumber =
						update.key.participant?.split('@')[0];

					notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}`;
					sendTo = store.jid;
				} else {
					const senderNumber = msg.key.remoteJid?.split('@')[0];
					const deleterNumber =
						update.key.remoteJid?.split('@')[0];

					notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}`;
					sendTo = conn.user.id;
				}

				if (
					msg.message?.conversation ||
					msg.message?.extendedTextMessage
				) {
					await handleTextMessage(
						conn,
						msg,
						sendTo,
						notificationText,
						isGroup,
						update,
					);
				} else {
					await handleMediaMessage(
						conn,
						msg,
						sendTo,
						notificationText,
						isGroup,
						update,
					);
				}
			}
		}
	}
};
