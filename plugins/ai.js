import { bot } from '#lib';
import { XSTRO } from '#utils';

bot(
	{
		pattern: 'ai',
		public: true,
		desc: 'Chat with an AI Bot',
		type: 'ai',
	},
	async (message, match) => {
		const msg = await message.send('*Thinking*');
		const res = await XSTRO.chatbot(match || message.reply_message.text);
		return await msg.edit(res);
	},
);
