import { bot } from '#lib';
import { inspect } from 'util';
import { isSudo } from '#sql';

bot(
	{
		on: 'text',
		dontAddCommandList: true,
	},
	async message => {
		if (!message.text) return;
		if (!(await isSudo(message.sender, message.user))) return;
		if (!message?.text?.startsWith('$ ')) return;

		const code = message.text.slice(2).trim().replace(/\$\s*/g, '');

		try {
			const result = await eval(`(async () => { ${code} })()`);

			const output =
				result === undefined
					? 'undefined'
					: result === null
					? 'null'
					: typeof result === 'function'
					? result.toString()
					: inspect(result, {
							depth: null,
							colors: false,
							maxArrayLength: null,
							maxStringLength: null,
					  });

			return await message.send(`*Result:*\n\`\`\`${JSON.parse(JSON.stringify(output))}\`\`\``, { type: 'text' });
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.send(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	},
);

bot(
	{
		pattern: 'eval ?(.*)',
		public: false,
		desc: 'Evaluate code',
		type: 'system'
	},
	async (message, match) => {
		const src_code = match || message.reply_message?.text;
		if (!src_code) return message.send('_Provide code to evaluate_');
		const code = src_code.trim().replace(/\$\s*/g, '');
		try {
			const result = await eval(`(async () => { ${code} })()`);
			const output =
				result === undefined
					? 'undefined'
					: result === null
					? 'null'
					: typeof result === 'function'
					? result.toString()
					: inspect(result, {
							depth: null,
							colors: false,
							maxArrayLength: null,
							maxStringLength: null,
					  });
			return await message.send(`*Result:*\n\`\`\`${JSON.parse(JSON.stringify(output))}\`\`\``, { type: 'text' });
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.send(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	},
);
