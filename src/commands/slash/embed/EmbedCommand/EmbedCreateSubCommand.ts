import Command, { IContextInteractionCommand, SubCommand } from '../../../../structures/Command';

import EmbedEditor from '../../../../utils/EmbedEditor';

class PingCommand extends SubCommand {
    constructor(client: Client, parent: Command) {
        super(client, {
            name: 'create',
            dirname: __dirname,
            requirements: {
                permissions: {
                    discord: ['administrator'],
                }
            }
        }, parent);
    }

    public async run(context: IContextInteractionCommand) {
        const editor = new EmbedEditor(this.client, context.user, context.channel);

        await context.interaction.createMessage(editor.message());

        editor.init(context.interaction.editOriginalMessage);
    }
}

export default PingCommand;