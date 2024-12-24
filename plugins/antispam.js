import { bot } from '#lib';
import { setAntiSpam, getAntiSpamMode } from '#sql';
import { isJidGroup } from 'baileys';

bot(
	{
		pattern: 'antispam',
		public: false,
		desc: 'Simple Antispam Setup',
		type: 'user',
	},
	async (message, match) => {
		const jid = message.jid;
		const isGroup = isJidGroup(jid);
		const prefix = message.prefix;

		if (!match) {
			return message.send(
				`Usage:\n` +
					`${prefix}antispam on\n` +
					(isGroup
						? `${prefix}antispam set [kick|delete]\n`
						: '') +
					`${prefix}antispam off`,
			);
		}

		const [command, action] = match.toLowerCase().split(' ');

		try {
			switch (command) {
				case 'on': {
					const currentMode = await getAntiSpamMode(jid);
					if (currentMode !== 'off') {
						return message.send(
							isGroup
								? '_Antispam is already enabled for this group._'
								: '_Dm antispam is already enabled._',
						);
					}

					// For DMs, use 'block', for groups use 'none'
					const mode = isGroup ? 'off' : 'block';
					await setAntiSpam(jid, mode);

					return message.send(
						isGroup
							? '_Antispam enabled. Use `antispam set` to configure._'
							: '_Dm antispam enabled._',
					);
				}

				case 'set': {
					if (!isGroup) {
						return message.send(
							'_This command is only for groups._',
						);
					}

					if (!['kick', 'delete'].includes(action)) {
						return message.send(
							'_Use `antispam set kick` or `antispam set delete`._',
						);
					}

					await setAntiSpam(jid, action);
					return message.send(`_Antispam set to: ${action}_`);
				}

				case 'off': {
					const currentMode = await getAntiSpamMode(jid);
					if (currentMode === 'off') {
						return message.send(
							isGroup
								? '_Antispam is already disabled for this group._'
								: '_Dm antispam is already disabled._',
						);
					}

					await setAntiSpam(jid, 'off');
					return message.send(
						isGroup
							? '_Antispam disabled for this group._'
							: '_Dm antispam disabled._',
					);
				}

				default:
					return message.send(
						`Usage:\n` +
							`${prefix}antispam on\n` +
							(isGroup
								? `${prefix}antispam set [kick|delete]\n`
								: '') +
							`${prefix}antispam off`,
					);
			}
		} catch (error) {
			console.error('Antispam configuration error:', error);
			return message.send(
				'_An error occurred while configuring antispam._',
			);
		}
	},
);
