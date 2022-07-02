import Command, { IContextInteractionCommand } from '../../../structures/Command';

class PingCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ping',
            dirname: __dirname,
        });
    }

    public async run(context: IContextInteractionCommand) {
        context.interaction.createMessage('Pong!');
    }
}

export default PingCommand;