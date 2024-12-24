import { execSync } from 'child_process';

export async function updateBot() {
	try {
		execSync('git stash');
		execSync('git pull origin');
		execSync('npm start');
		return { success: true };
	} catch {
		return false;
	}
}

export async function isLatest() {
	try {
		execSync('git fetch');
		const localCommit = execSync('git rev-parse HEAD').toString().trim();
		const remoteCommit = execSync('git rev-parse @{upstream}').toString().trim();
		if (localCommit === remoteCommit) {
			return {
				latest: true,
				commit: localCommit,
			};
		} else {
			return {
				latest: false,
				localCommit,
				remoteCommit,
			};
		}
	} catch {
		return {
			latest: false,
			localCommit: null,
			remoteCommit: null,
		};
	}
}
