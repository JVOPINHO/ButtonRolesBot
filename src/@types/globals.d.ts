import { Logger } from 'winston';

import Client from '../structures/Client';
import Command, { ContextCommand, CommandGroup, SubCommand } from '../structures/Command'

declare global {
    var logger: Logger;
    type Client = Client;

    type Command = Command;
    type CommandGroup = CommandGroup;
    type SubCommand = SubCommand;
    type ContextCommand = ContextCommand;
    
    namespace NodeJS {
        interface ProcessEnv {
            readonly DISCORD_TOKEN: string;
        }
    }
}

export {}