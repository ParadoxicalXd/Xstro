import { bot } from '#lib';
import { XSTRO } from '#utils';

bot(
	{
		pattern: 'facts',
		public: true,
		desc: 'Get random facts',
		type: 'fun',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.facts()}\`\`\``);
	},
);

bot(
	{
		pattern: 'quotes',
		public: true,
		desc: 'Get random quotes',
		type: 'fun',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.quotes()}\`\`\``);
	},
);

bot(
	{
		pattern: 'advice',
		public: true,
		desc: 'Get random advice',
		type: 'fun',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.advice()}\`\`\``);
	},
);

bot(
	{
		pattern: 'rizz',
		public: true,
		desc: 'Get random rizz',
		type: 'fun',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.rizz()}\`\`\``);
	},
);

bot(
	{
		pattern: 'bible',
		public: true,
		desc: 'Get random bible verse',
		type: 'search',
	},
	async (message, match) => {
		if (!match)
			return await message.send('Please provide a verse:\n.john3:16');
		return await message.send(
			`\`\`\`${await XSTRO.bible(match.trim())}\`\`\``,
		);
	},
);

bot(
	{
		pattern: 'fancy',
		public: true,
		desc: 'Convert text to fancy text',
		type: 'tools',
	},
	async (message, match) => {
		if (!match) return await message.send('Please provide a text');
		return await message.send(await XSTRO.fancy(match));
	},
);
