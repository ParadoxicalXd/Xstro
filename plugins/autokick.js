import { bot } from '#lib';
import { addAKick, delKick, getKicks } from '#sql';

const ACTIONS = {
	async add(message, groupId, jid) {
		const added = await addAKick(groupId, jid);
		return added
			? `_User added to auto-kick list._ @${jid.split('@')[0]}`
			: `_User is already on the list._ @${jid.split('@')[0]}`;
	},

	async del(message, groupId, jid) {
		const deleted = await delKick(groupId, jid);
		return deleted
			? `_User removed from auto-kick list._ @${jid.split('@')[0]}`
			: `_User was not on the list._ @${jid.split('@')[0]}`;
	},

	async get(message, groupId) {
		const kicks = await getKicks(groupId);
		if (kicks.length > 0) {
			return (
				`_Users in auto-kick list:_\n${kicks
					.map(k => `• @$${k.userJid.split('@')[0]}`)
					.join('\n')}`,
				{ mentions: [kicks] }
			);
		}
		return '_No users found in the auto-kick list._';
	},
};

bot(
	{
		pattern: 'akick',
		public: false,
		isGroup: true,
		desc: 'AutoKicks a member from the group.',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin)
			return message.send('```You are not an Admin```');
		if (!message.isBotAdmin)
			return message.send('```I am not an Admin```');

		const [action, ...rest] = match?.toLowerCase().split(' ') || [];
		const groupId = message.jid;
		const jid = await message.getUserJid();

		if (ACTIONS[action]) {
			const response = await ACTIONS[action](message, groupId, jid);
			return message.send(response);
		}
		return message.send('_Invalid action! Use add, del, or get._');
	},
);
