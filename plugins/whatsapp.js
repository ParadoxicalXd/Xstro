import config from '#config';
import { getName, loadMessage } from '#sql';
import { bot, numtoId, smsg } from '#lib';
import { getBuffer } from 'xstro-utils';
import { isJidGroup } from 'baileys';

bot(
	{
		pattern: 'vv',
		public: false,
		type: "whatsapp",
		desc: 'Download ViewOnce Messages',
	},
	async message => {
		if (!message.reply_message.viewonce) return message.send('_Reply A ViewOnce_');
		const media = await message.download();
		return await message.forward(media);
	},
);

bot(
	{
		pattern: 'myname',
		public: false,
		type: "whatsapp",
		desc: 'Changes your WhatsApp Name',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide A New Name_');
		await message.updateName(match.toString());
		return message.send('_WhatsApp Name Updated!_');
	},
);

bot(
	{
		pattern: 'setpp',
		public: false,
		type: "whatsapp",
		desc: 'Set Your Profile Picture',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const img = await message.download();
		await message.updatePP(img);
		return await message.send('_Profile Picture Updated_');
	},
);

bot(
	{
		pattern: 'quoted',
		public: false,
		type: "whatsapp",
		desc: 'quoted message',
	},
	async message => {
		if (!message.reply_message) return await message.send('```Reply A Message```');
		let key = message.reply_message.key.id;
		let msg = await loadMessage(key);
		if (!msg) return await message.send('```Xstro will not quoted Bot Message```');
		msg = await smsg(JSON.parse(JSON.stringify(msg.message)), message.client);
		if (!msg.quoted) return await message.send('_No quoted message found_');
		await message.forward(message.jid, msg.quoted, { quoted: msg.quoted });
	},
);

bot(
	{
		pattern: 'dlt',
		public: false,
		type: "whatsapp",
		desc: 'Deletes Message',
	},
	async message => {
		if (!message.reply_message) return message.send('_Reply A Message_');
		return await message.delete();
	},
);

bot(
	{
		pattern: 'archive',
		public: false,
		type: "whatsapp",
		desc: 'archive whatsapp chat',
	},
	async message => {
		await message.archiveChat(true);
		await message.send('_Archived_');
	},
);

bot(
	{
		pattern: 'unarchive',
		public: false,
		type: "whatsapp",
		desc: 'unarchive whatsapp chat',
	},
	async message => {
		await message.archiveChat(false);
		await message.send('_Unarchived_');
	},
);

bot(
	{
		pattern: 'blocklist',
		public: false,
		type: "whatsapp",
		desc: 'Fetches BlockList',
	},
	async message => {
		const blocklist = await message.client.fetchBlocklist();
		if (blocklist.length > 0) {
			const mentions = blocklist.map(number => `${number}`);
			const formattedList = blocklist.map(number => `• @${number.split('@')[0]}`).join('\n');
			await message.send(`*_Blocked contacts:_*\n\n${formattedList}`, { mentions });
		} else {
			await message.send('_No blocked Numbers!_');
		}
	},
);

bot(
	{
		pattern: 'clear ?(.*)',
		public: false,
		type: "whatsapp",
		desc: 'delete whatsapp chat',
	},
	async message => {
		await message.clearChat();
		await message.send('_Cleared_');
	},
);

bot(
	{
		pattern: 'rpp',
		public: false,
		type: "whatsapp",
		desc: 'Removes Profile Picture',
	},
	async message => {
		await message.rPP();
		return message.send('_Profile Picture Removed!_');
	},
);

bot(
	{
		pattern: 'pin',
		public: false,
		type: "whatsapp",
		desc: 'pin a chat',
	},
	async message => {
		await message.client.chatModify({ pin: true }, message.jid);
		return message.send('_Pined.._');
	},
);

bot(
	{
		pattern: 'unpin ?(.*)',
		public: false,
		type: "whatsapp",
		desc: 'unpin a msg',
	},
	async message => {
		await message.client.chatModify({ pin: false }, message.jid);
		return message.send('_Unpined.._');
	},
);

bot(
	{
		pattern: 'save',
		public: false,
		type: "whatsapp",
		desc: 'Saves Status',
	},
	async message => {
		if (!message.reply_message) return message.send('_Reply A Status_');
		const msg = await message.data?.quoted;
		await message.forward(message.user, msg, { force: false, quoted: msg });
	},
);

bot(
	{
		pattern: 'forward',
		public: false,
		type: "whatsapp",
		desc: 'Forwards A Replied Message',
	},
	async (message, match) => {
		if (!message.reply_message) return message.send('_Reply A Message!_');
		let jid;
		if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (isJidGroup(match)) {
			jid = match;
		} else if (!isJidGroup(match)) {
			jid = numtoId(match);
		}
		if (!jid) return message.send('_You have to provide a number/tag someone_');
		const msg = message.data?.quoted;
		await message.forward(jid, msg, { quoted: msg });
		return await message.send(`_Message forward to @${jid.split('@')[0]}_`, {
			mentions: [jid],
		});
	},
);

bot(
	{
		pattern: 'block',
		public: false,
		type: "whatsapp",
		desc: 'Blocks A Person',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		await message.Block(jid);
	},
);

bot(
	{
		pattern: 'unblock',
		public: false,
		type: "whatsapp",
		desc: 'Unblocks A Person',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		await message.Unblock(jid);
	},
);

bot(
	{
		pattern: 'edit',
		public: false,
		type: "whatsapp",
		desc: 'Edits A Sent Message',
	},
	async (message, match, { prefix }) => {
		if (!message.reply_message) return message.send('_Reply Your Own Message_');
		if (!match) return await message.send('```' + prefix + 'edit hello```');
		await message.edit(match);
	},
);

bot(
	{
		pattern: 'jid',
		public: true,
		type: "whatsapp",
		desc: 'Get Jid of Current Chat',
	},
	async message => {
		const jid = await message.getUserJid();
		message.send(jid);
	},
);

bot(
	{
		pattern: 'bio',
		public: true,
		type: "whatsapp",
		desc: 'Change your whatsapp bio',
	},
	async (message, match, { prefix }) => {
		if (!match) return message.send(`_Usage:_\n_${prefix}bio Hello World_`);
		await message.client.updateProfileStatus(match);
		return await message.send('```WhatsApp bio Updated to "' + match + '"```');
	},
);

bot(
	{
		pattern: 'react',
		public: false,
		type: "whatsapp",
		desc: 'React to A Message',
	},
	async (message, match) => {
		if (!message.reply_message) return message.send('```Reply A Message```');
		if (message.reply_message?.fromMe) return message.send('```Cannot React to yourself Bro```');
		if (!match) return message.send('```react 😊```');
		return message.client.sendMessage(message.jid, { react: { text: match, key: message.reply_message.key } });
	},
);

bot(
	{
		pattern: 'star',
		public: false,
		type: "whatsapp",
		desc: 'Stars or Unstars a Message',
	},
	async message => {
		const replyMessage = message.reply_message;
		if (!replyMessage) return message.send('_Reply to a message to star it_');
		const jid = message.jid;
		const messages = [{ id: replyMessage.id, fromMe: replyMessage.fromMe }];
		const star = true;
		await message.client.star(jid, messages, star);
	},
);

bot(
	{
		pattern: 'unstar',
		public: false,
		type: "whatsapp",
		desc: 'Stars or Unstars a Message',
	},
	async message => {
		const replyMessage = message.reply_message;
		if (!replyMessage) return message.send('_Reply to a message to star it_');
		const jid = message.jid;
		const messages = [{ id: replyMessage.id, fromMe: replyMessage.fromMe }];
		const star = false;
		await message.client.star(jid, messages, star);
	},
);

bot(
	{
		pattern: 'owner',
		public: true,
		type: "whatsapp",
		desc: 'Get Bot Owner',
	},
	async message => {
		const name = await getName(message.user);
		const img = await getBuffer('https://avatars.githubusercontent.com/u/188756392?v=4');
		const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + config.BOT_INFO.split(';')[0] + '\n' + 'TEL;type=CELL;type=VOICE;waid=' + message.user.split('@')[0] + ':' + message.user.split('@')[0] + '\n' + 'END:VCARD';

		return await message.client.sendMessage(message.jid, {
			contacts: {
				displayName: name,
				contacts: [{ vcard }],
			},
			contextInfo: {
				forwardingScore: 999,
				isForwarded: true,
				externalAdReply: {
					title: config.BOT_INFO.split(';')[0],
					body: config.BOT_INFO.split(';')[1],
					mediaType: 1,
					thumbnail: img,
					sourceUrl: 'https://github.com/AstroX11/Xstro',
					renderLargerThumbnail: true,
				},
			},
		});
	},
);
bot(
	{
		pattern: 'gjid',
		public: true,
		type: "whatsapp",
		isGroup: true,
		desc: 'Get JID of the Current Group',
	},
	async message => {
		message.send(`Group JID: ${message.jid}`);
	},
);



//======================================================

bot({
    pattern: 'gforward',
    public: false,
    type: 'whatsapp',
    desc: 'Forwards a replied message to multiple groups',
},
async (message, match) => {
    if (!message.reply_message) return message.send('_Reply to a message to forward it!_');
    if (!match) return message.send('_Provide a comma-separated list of group JIDs._');

    const groupJids = match.split(',').map(jid => jid.trim()).filter(isJidGroup);

    if (groupJids.length === 0) {
        return message.send('_You must provide valid group JIDs._');
    }

    const msg = message.data?.quoted;
    let successfulForwards = 0;
    let failedForwards = 0;

    for (const jid of groupJids) {
        try {
            await message.forward(jid, msg, { quoted: msg });
            successfulForwards++;
        } catch (error) {
            console.error(`Failed to forward to ${jid}:`, error);
            failedForwards++;
        }
    }

    return message.send(
        `_Message forwarded to ${successfulForwards} group(s). Failed to forward to ${failedForwards} group(s)._`
    );
});


