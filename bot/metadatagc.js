import { saveGroupMetadata } from '#sql';

export const updateGroupMetadata = async msg => {
	const conn = msg.client;
	try {
		setInterval(async () => {
			const groups = await conn.groupFetchAllParticipating();
			if (!groups) return;
			for (const jid of Object.keys(groups)) await saveGroupMetadata(jid, conn);
		}, 150000);
	} catch {
		console.log('Rate Limit Hit');
	}
};
