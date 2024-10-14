export function getChannelName(): string | null {
    const channelName = process.env.DELETE_OLD_MESSAGES_CHANNEL;
    if (!channelName) {
        return null;
    }
    return channelName;
}
