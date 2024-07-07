export function getChannelName(): string | null {
	const channel_name = process.env.DELETE_OLD_MESSAGES_CHANNEL;
	if (!channel_name) {
		return null;
	}
	return channel_name;
}
