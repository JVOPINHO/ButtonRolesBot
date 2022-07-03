import Event from '../structures/Event';

class ReadyEvent extends Event {
    constructor(client: Client) {
        super(client, 'ready');
    }

    async run() {
        logger.info(`Logged in as ${this.client.user?.username}`, { label: `Client` });
    }
}

export default ReadyEvent;