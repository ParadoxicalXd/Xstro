import { bot } from '#lib';
import { apkDl, XSTRO } from '#utils';
import {
	extractUrlFromString,
	FileTypeFromBuffer,
	getBuffer,
} from 'xstro-utils';

bot(
	{
		pattern: 'apk',
		public: true,
		desc: 'Downloads Apk',
		type: 'download',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide Apk to Download_');
		const res = await apkDl(match);
		const { appname, link } = res;
		const buff = await getBuffer(link);
		return await message.sendMessage(buff, {
			type: 'document',
			mimetype: 'application/vnd.android.package-archive',
			fileName: appname + '.apk',
		});
	},
);

bot(
	{
		pattern: 'facebook',
		public: true,
		desc: 'Download Facebook Video',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Facebook link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.facebook(url);
		return await message.send(media);
	},
);

bot(
	{
		pattern: 'instagram',
		public: true,
		desc: 'Download Instagram Video',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Instagram link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.instagram(url);
		return await message.send(media, { type: 'video' });
	},
);

bot(
	{
		pattern: 'twitter',
		public: true,
		desc: 'Download Twitter Video',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Twitter link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.twitter(url);
		return await message.send(media, { type: 'video' });
	},
);

bot(
	{
		pattern: 'yta',
		public: true,
		desc: 'Download Youtube Audio',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Youtube link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.youtube(url, { mp3: true });
		return await message.send(media.url);
	},
);

bot(
	{
		pattern: 'ytv',
		public: true,
		desc: 'Download Youtube Video',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Youtube link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.youtube(url, { mp4: true });
		return await message.send(media.url, {
			type: 'video',
			caption: media.title,
		});
	},
);

bot(
	{
		pattern: 'tiktok',
		public: true,
		desc: 'Download Tiktok Video',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Tiktok link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.tiktok(url);
		return await message.send(media.url, { caption: media.title });
	},
);

bot(
	{
		pattern: 'mediafire',
		public: true,
		desc: 'Downloads Mediafire files from url',
		type: 'download',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Mediafire link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.mediafire(url);
		const buff = await getBuffer(media.link);
		const type = await FileTypeFromBuffer(buff);
		return await message.sendMessage(buff, {
			type: 'document',
			mimetype: res.mime[0],
			fileName: 'file' + type,
		});
	},
);
