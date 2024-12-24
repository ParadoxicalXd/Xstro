import { bot } from '#lib';
import { delay } from 'baileys';

bot(
	{
		pattern: 'advertise',
		public: false,
		isGroup: true,
		desc: 'Create and Share Advertisement Messages to all Your Groups',
		type: 'group',
	},
	async (message, match) => {
		const adMsg = match || message.reply_message?.text;
		if (!adMsg) return message.send('_I need text to advertise!_');
		const groups = await message.client.groupFetchAllParticipating();
		const groupDetails = Object.values(groups);
		const groupIds = groupDetails.map(group => group.id);
		await message.send(
			`_Broadcasting to ${
				groupIds.length
			} groups. Estimated completion in ${
				groupIds.length * 1.5
			} seconds_`,
		);
		const broadcastMessage =
			`\`\`\`*Broadcast*\n\n*Message:*\`\`\`` + adMsg;
		const messageOptions = {
			forwardingScore: 9999999,
			isForwarded: true,
		};
		for (const groupId of groupIds) {
			await delay(1500);
			await message.client.sendMessage(groupId, {
				text: broadcastMessage,
				contextInfo: messageOptions,
			});
		}
		return await message.send(
			`_Advertised Message to ${groupIds.length} Groups_`,
		);
	},
);
