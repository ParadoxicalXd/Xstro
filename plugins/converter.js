import { bot } from '#lib';
import { upload, XSTRO } from '#utils';

bot(
	{
		pattern: 'sticker',
		public: true,
		desc: 'Converts Images and Videos to Sticker',
		type: 'converter',
	},
	async message => {
		let media;
		if (
			!message.reply_message ||
			(!message.reply_message.image && !message.reply_message.video)
		)
			return message.send('_Reply with an Image or Video_');
		media = await message.download();
		let url = await upload(media);
		const sticker = await XSTRO.makeSticker(url.rawUrl);
		return await message.send(sticker, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'take',
		public: true,
		desc: 'rebrands a sticker to bot',
		type: 'converter',
	},
	async message => {
		let media;
		if (!message.reply_message.sticker)
			return message.send('_Reply a sticker only!_');
		media = await message.download();
		let url = await upload(media);
		const sticker = await XSTRO.makeSticker(url.rawUrl);
		return await message.send(sticker, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'flip',
		public: true,
		desc: 'Flip media left/right/vertical/horizontal',
		type: 'converter',
	},
	async (message, match) => {
		const { reply_message } = message;
		if (!reply_message?.image && !reply_message?.video)
			return message.send('_Reply to an Image or Video_');

		const validDirections = ['left', 'right', 'vertical', 'horizontal'];
		if (!validDirections.includes(match))
			return message.send(
				`_Usage: ${message.prefix}flip <${validDirections.join(
					'/',
				)}>`,
			);

		const media = await message.download();
		const { rawUrl } = await upload(media);
		const flipped = await XSTRO.flipMedia(rawUrl, match);

		return message.send(flipped, { caption: '_Flipped successfully_' });
	},
);

bot(
	{
		pattern: 'black',
		public: true,
		desc: 'Converts Audio to Black Video',
		type: 'converter',
	},
	async message => {
		let media;
		if (!message.reply_message.audio)
			return message.send('_Reply Audio_');
		media = await message.download();
		const url = await upload(media);
		const video = await XSTRO.blackvideo(url.rawUrl);
		return await message.send(video);
	},
);

bot(
	{
		pattern: 'ttp',
		public: true,
		desc: 'Designs ttp Stickers',
		type: 'converter',
	},
	async (message, match, { prefix }) => {
		if (!match) return message.send(`_Usage: ${prefix}ttp Astro_`);
		const buff = await XSTRO.ttp(match);
		const { rawUrl } = await upload(buff);
		const sticker = await XSTRO.makeSticker(rawUrl);
		return await message.send(sticker, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'photo',
		public: true,
		desc: 'Convert Sticker to Photo',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message.sticker)
			return message.send('_Reply Sticker_');
		const { rawUrl } = await upload(await message.download());
		const img = await XSTRO.photo(rawUrl);
		return await message.send(img);
	},
);

bot(
	{
		pattern: 'mp3',
		public: true,
		desc: 'Convert Video to Audio',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message.video)
			return message.send('_Reply Video_');
		const { rawUrl } = await upload(await message.download());
		const mp3 = await XSTRO.mp3(rawUrl);
		return await message.send(mp3);
	},
);
