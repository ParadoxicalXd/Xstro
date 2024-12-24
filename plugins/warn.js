import { bot } from '#lib';
import { addWarn, getWarn, resetWarn } from '#sql';
import config from '#config';

const { WARN_COUNT } = config;

bot(
	{
		pattern: 'warn',
		public: false,
		type: "group",
		desc: 'Warn a user for violating rules',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const { success, warnings } = await addWarn(jid);
		if (success) {
			if (warnings >= WARN_COUNT) {
				await message.send(`\`\`\`User has been warned ${warnings} times. Maximum limit reached. Taking action!\`\`\``);
				if (message.isGroup && message.isBotAdmin) {
					await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
					await message.send(`\`\`\`@${jid.split('@')[0]} has been dealt with\`\`\``, { mentions: [jid] });
					await message.Block(jid);
				} else {
					await message.Block(jid);
				}
			} else {
				await message.send(`\`\`\`@${jid.split('@')[0]} has been warned.\nWarnings: ${warnings}\`\`\``, { mentions: [jid] });
			}
		}
	},
);

bot(
	{
		pattern: 'getwarn',
		public: false,
		type: "group",
		desc: 'Check warnings of a user',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const { warnings } = await getWarn(jid);
		await message.send(`\`\`\`@${jid.split('@')[0]} has ${warnings} warnings.\`\`\``);
	},
);

bot(
	{
		pattern: 'resetwarn',
		public: false,
		type: "group",
		desc: 'Reset warnings of a user',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const { success } = await resetWarn(jid);
		if (success) {
			await message.send('```@' + jid.split('@')[0] + ' is free as a Cow```', { mentions: [jid] });
		}
	},
);
