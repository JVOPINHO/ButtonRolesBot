import Event from '../structures/Event';

class ReadyEvent extends Event {
    constructor(client: Client) {
        super(client, 'ready');
    }

    async run() {
        logger.info(`Logged in as ${this.client.user?.username}`, { label: `Cluster ${process.env.CLUSTER_ID}, Client` });
    }
}

export default ReadyEvent;