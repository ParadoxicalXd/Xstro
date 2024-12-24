import { bot } from '#lib';
import { isLatest, updateBot } from '#utils';

bot(
	{
		pattern: 'update',
		public: false,
		type: "system",
		desc: 'Updates Bot',
	},
	async (message, match) => {
		const updated = await isLatest();
		if (updated.latest) {
			return message.send('```You are on the Latest Update```');
		}
		await message.send(`\`\`\`Old Patch: ${updated.localCommit}\n\nLatest Patch: ${updated.remoteCommit}\`\`\``);
		if (match.toString().toLowerCase() === 'now') {
			await message.send('```Updating Bot```');
			await updateBot();
			await message.send('```Bot Updated```');
		} else {
			return message.send('```Invalid, use ' + message.prefix + 'update now```');
		}
	},
);
