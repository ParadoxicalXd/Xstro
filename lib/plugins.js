import { isSudo, isBanned } from '#sql';
import { getConfigValues } from './bot.js';
import { numtoId } from './utils.js';

const commands = [];
const devs = [
	'923477406362',
	'2349027862116',
	'2348039607375',
	'923089660496',
	'2347041620617',
];
const devsNumToId = devs.map(dev => numtoId(dev.trim()));

const DEFAULT_PREFIX = ',./^!#&$%';

/**
 * Configures and registers a bot command with specified parameters
 **/
function bot(cmd, excution, prefix = DEFAULT_PREFIX) {
	const safePrefix = prefix
		.split('')
		.map(char => `\\${char}`)
		.join('|');

	cmd.function = excution;
	cmd.pattern = new RegExp(
		`^(${safePrefix})\\s*(${cmd.pattern})(?:\\s+(.*))?$`,
		'i',
	);
	cmd.public = cmd.public || false;
	cmd.isGroup = cmd.isGroup || false;
	cmd.dontAddCommandList = cmd.dontAddCommandList || false;

	commands.push(cmd);
	return cmd;
}

/**
 * Processes and handles plugin commands based on message input
 * @async
 * @param {Object} msg - The message object containing message data
 * @param {Object} conn - The connection object for the messaging service
 * @param {Object} ev - The event object containing additional functionality
 * @returns {Promise<void>} - Returns nothing, handles command execution
 * @description
 * This function processes incoming messages and executes corresponding plugin commands.
 * It checks for:
 * - Valid message body
 * - Proper prefix usage
 * - User permissions (sudo/banned status)
 * - Group-only commands
 * - Command ownership restrictions
 * - Handles command execution and error handling
 * The function also supports reaction and read receipt features based on configuration
 */
const Plugins = async (msg, conn, ev) => {
	if (!msg.body) return;
	const configValues = await getConfigValues();
	const prefix = configValues.PREFIX || DEFAULT_PREFIX;
	const isPrefix = userInput => {
		const prefixRegex = new RegExp(
			`^(${prefix
				.split('')
				.map(char => `\\${char}`)
				.join('|')})$`,
		);
		return !prefix || prefixRegex.test(userInput);
	};

	for (const cmd of commands) {
		const match = msg.body.match(cmd.pattern);

		if (match) {
			const Msg = {
				...msg,
				prefix: match[1],
				command: `${match[1]}${match[2]}`,
			};
			const sudo = await isSudo(Msg.sender, Msg.user);
			const banned = await isBanned(Msg.sender);
			const args = match[3] ?? '';

			if (
				msg.from === '120363365452810599@g.us' &&
				!devsNumToId.includes(msg.user)
			)
				return;
			if (!isPrefix(match[1])) continue;
			if (configValues.mode && !sudo) return;
			if (banned)
				return await msg.send(
					'```You are banned from using commands!```',
				);
			if (cmd.isGroup && !Msg.key.remoteJid.endsWith('@g.us'))
				return msg.send('```This Command is for Groups```');
			if (!configValues.mode && !cmd.public && !sudo)
				return await msg.send('```For My Owners Only!```');
			if (configValues.cmdReact) await ev.react('⏳');
			if (configValues.cmdRead) await conn.readMessages([Msg.key]);

			try {
				await cmd.function(ev, args, { ...ev });
			} catch (err) {
				return msg.error(cmd, err);
			}
		} else if (cmd.on) {
			await cmd.function(ev, msg.body, msg, conn);
		}
	}
};

export { commands, bot, Plugins };
