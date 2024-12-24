import { bot } from '#lib';
import { getConfig, updateConfig } from '#sql';

bot(
	{
		pattern: 'config',
		public: false,
		desc: 'Get Database configurations',
		type: 'user',
	},
	async message => {
		const db_list = await getConfig();
		const { autoRead, autoStatusRead, cmdReact, mode, PREFIX } = db_list;
		return await message.send(
			`\`\`\`DATABASE CONFIGURATIONS\nAutoRead: ${autoRead}\nAutoReadStatus: ${autoStatusRead}\nCmdReact: ${cmdReact}\nMode: ${
				mode ? 'private' : 'public'
			}\nPrefix: ${PREFIX}\`\`\``,
		);
	},
);

bot(
	{
		pattern: 'autoread',
		public: false,
		desc: 'Set bot to automatically read messages',
		type: 'user',
	},
	async (message, match) => {
		const newValue =
			match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null)
			return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autoRead === newValue)
			return await message.send(
				`_AutoRead is already set to ${newValue ? 'on' : 'off'}._`,
			);

		await updateConfig('autoRead', newValue);
		return await message.send(
			`_AutoRead set to ${newValue ? 'on' : 'off'}._`,
		);
	},
);

bot(
	{
		pattern: 'autostatus',
		public: false,
		desc: 'Set bot to automatically read status',
		type: 'user',
	},
	async (message, match) => {
		const newValue =
			match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null)
			return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autoStatusRead === newValue)
			return await message.send(
				`_AutoStatusRead is already set to ${
					newValue ? 'on' : 'off'
				}._`,
			);

		await updateConfig('autoStatusRead', newValue);
		return await message.send(
			`_AutoStatusRead set to ${newValue ? 'on' : 'off'}._`,
		);
	},
);

bot(
	{
		pattern: 'mode',
		public: false,
		desc: 'Set bot Mode private or public',
		type: 'user',
	},
	async (message, match) => {
		const newValue =
			match === 'private' ? true : match === 'public' ? false : null;
		if (newValue === null)
			return await message.send('_Use "private" or "public"_');
		const dbConfig = await getConfig();
		if (dbConfig.mode === newValue)
			return await message.send(
				`_Mode is already set to ${
					newValue ? 'private' : 'public'
				}._`,
			);

		await updateConfig('mode', newValue);
		return await message.send(
			`_Mode set to ${newValue ? 'private' : 'public'}._`,
		);
	},
);

bot(
	{
		pattern: 'cmdreact',
		public: false,
		desc: 'Set bot to react to Cmds',
		type: 'user',
	},
	async (message, match) => {
		const newValue =
			match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null)
			return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.cmdReact === newValue)
			return await message.send(
				`_CmdReact is already set to ${newValue ? 'on' : 'off'}._`,
			);

		await updateConfig('cmdReact', newValue);
		return await message.send(
			`_CmdReact set to ${newValue ? 'on' : 'off'}._`,
		);
	},
);

bot(
	{
		pattern: 'cmdread',
		public: false,
		desc: 'Set bot to read cmds',
		type: 'user',
	},
	async (message, match) => {
		const newValue =
			match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null)
			return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.cmdRead === newValue)
			return await message.send(
				`_cmdRead is already set to ${newValue ? 'on' : 'off'}._`,
			);

		await updateConfig('cmdReact', newValue);
		return await message.send(
			`_CmdRead set to ${newValue ? 'on' : 'off'}._`,
		);
	},
);

bot(
	{
		pattern: 'setprefix',
		public: false,
		desc: 'Setup bot prefix',
		type: 'user',
	},
	async (message, match, { prefix }) => {
		const newValue = match;
		if (!newValue) return await message.send(`${prefix}setprefix ,`);
		await updateConfig('PREFIX', newValue);
		return await message.send(`_Prefix set to "${newValue}"_`);
	},
);
