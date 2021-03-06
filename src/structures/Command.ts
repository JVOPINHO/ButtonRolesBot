import Client from './Client';
import Eris, { Constants } from 'eris';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';

interface ICommandRequirements {
    permissions?: {
        me?: Array<keyof typeof Constants.Permissions>;
        discord?: Array<keyof typeof Constants.Permissions>;
    },
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

interface IBase {
    name: string;
    dirname?: string;
    requirements?: ICommandRequirements | null;
    cooldown?: number;
}

class Base {
    public declare client: Client;
    public name: string;
    public dirname: string | undefined;
    public requirements?: ICommandRequirements | null;
    public cooldown: number;

    constructor(
        client: Client,
        data: IBase,
    ) {
        this.name = data.name;
        this.dirname = data.dirname || undefined;
        this.requirements = data.requirements || null;
        this.cooldown = data.cooldown || 0;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    };

    public async run(context: IContextMessageCommand|IContextInteractionCommand): Promise<any> {}

    public async autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {}

    public async replyMessage(
        message: IContextMessageCommand | ContextCommand | Eris.Message, 
        args: Eris.MessageContent
    ): Promise<Eris.Message|false> {
        if(message instanceof ContextCommand) {
            // @ts-ignore
            message = message.message;
        }

        if(!message) return false;

        return this.client.createMessage(
            message.channel.id, 
            Object.assign(args, { 
                messageReference: {  messageID: (message as Eris.Message).id } }
            )
        );
    }


    
    public verifyPermissions(context: IContextMessageCommand|IContextInteractionCommand, data = { me: true, member: true, }) {
        var requirements: ICommandRequirements;
        
        const { permissions } = this.requirements || {};
        if(permissions) {
            
            if (permissions.discord) {
                if (!permissions.discord.every(perm => context.member.permissions.has(perm))) data.member = false;
            }
        }
    
        return data;
    }

    public get commandName() {
        return this.name;
    }
}

class Command extends Base {
    public aliases: string[];
    public subcommands: Array<CommandGroup|SubCommand>;

    constructor(
        client: Client,
        data: {
            name: string;
            dirname?: string;
            requirements?: ICommandRequirements | null;
            cooldown?: number;
            aliases?: string[];
            subcommands?: Array<CommandGroup|SubCommand>;
        },
    ) {
        super(client, {
            name: data.name,
            dirname: data.dirname || undefined,
            requirements: data.requirements || null,
            cooldown: data.cooldown || 0,
        });
        this.aliases = data.aliases || [];
        this.subcommands = data.subcommands || [];
    };

    public get CommandGroup() {
        return CommandGroup;
    }

    public get SubCommand() {
        return SubCommand;
    }
};

class CommandGroup {
    public name: string;
    public subcommands: SubCommand[];
    public parent: Command;

    constructor(
        client: Client, 
        data: CommandGroup, 
        parent: Command,
    ) {
        this.name = data.name;
        this.subcommands = data.subcommands || [];
        this.parent = parent;

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }

    public get commandName() {
        return `${this.parent.commandName} ${this.name}`;
    }
}

class SubCommand extends Base {
    public parent: Command|CommandGroup;

    constructor(
        client: Client, 
        data: IBase, 
        parent: Command|CommandGroup,
    ) {
        super(client, {
            name: data.name,
            dirname: data.dirname || undefined,
            requirements: data.requirements || null,
            cooldown: data.cooldown || 0,
        });

        this.parent = parent;
    }

    public get commandName() {
        return `${this.parent.commandName} ${this.name}`;
    }
}

interface IContextCommand {
    client: Client;
    command: Command;
    args?: string[];
    message?: Eris.Message;
    interaction?: Eris.CommandInteraction;
    channel: Eris.TextableChannel;
    user: Eris.User;
}

interface IContextMessageCommand {
    client: Client;
    command: Command|SubCommand;
    args: string[];
    message: Eris.Message;
    interaction?: null;
    channel: Eris.TextableChannel;
    user: Eris.User;
    member: Eris.Member;
    guild: Eris.Guild;
}

interface IContextInteractionCommand {
    client: Client;
    command: Command|SubCommand;
    interaction: Eris.CommandInteraction;
    options: CommandInteractionOptions;
    channel: Eris.GuildTextableChannel;
    user: Eris.User;
    member: Eris.Member;
    guild: Eris.Guild;
}

class ContextCommand {
    public declare client: Client;

    public command: Command|SubCommand;
    public args: string[] | null;
    public message: Eris.Message | null;
    public interaction: Eris.CommandInteraction | null;
    public options?: CommandInteractionOptions | [];

    public author: Eris.User;
    public user: Eris.User;
    public member: Eris.Member | null;
    public guild: Eris.Guild | null;
    public channel: Eris.TextableChannel;

    public dm: boolean;
    public slash: boolean;
    public prefix: string;

    constructor(
        { client, message, interaction, command, user, args, channel }: IContextCommand,
    ) {
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
        
        this.command = command;

        this.message = message || null;
        this.interaction = interaction || null;
        
        this.args = args || [];
        this.options = interaction ? new CommandInteractionOptions(interaction?.data?.resolved, interaction?.data?.options || []) : [];

        if(this.options instanceof CommandInteractionOptions) {
            if(interaction?.data?.type == Eris.Constants.ApplicationCommandTypes.USER) {
                this.options.setOptions(
                    {
                        type: Eris.Constants.ApplicationCommandOptionTypes.USER,
                        name: 'user',
                        value: interaction?.data?.target_id,
                    }
                );
            }
        }

        const guild = (interaction || message)?.member?.guild || null;

        this.user = user;
        this.author = user;
        this.member = (interaction || message)?.member || null;
        this.guild = guild;
        this.channel = channel;

        this.dm = (message || interaction)?.channel.type === 1;
        this.slash = !!interaction;
        this.prefix = interaction ? '/' : this.client.config.prefix;
    };
}



export default Command;
export { 
    ContextCommand,
    CommandGroup,
    SubCommand, 
    Client, 
    IContextMessageCommand, 
    IContextInteractionCommand 
};