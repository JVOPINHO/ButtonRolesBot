import Eris, { ClientOptions } from 'eris';
import fs from 'fs';
import { Sydb } from 'sydb';

import Event from './Event';
import Command, { CommandGroup, SubCommand } from './Command';

interface IClientCommands {
    slash: Command[],
    vanilla: Command[],
    user: Command[],
    message: Command[],
}

class Client extends Eris.Client {
    public events: Event[];
    public commands: IClientCommands;
    public config: { 
        prefix: string, 
        owners: string[], 
    };
    public cases: number;

    public db = new Sydb({ path: 'db.json' });

    constructor(
        token: string, 
        options: ClientOptions
    ) {
        super(token, options);

        this.events = [];
        this.commands = {
            slash: [],
            vanilla: [],
            user: [],
            message: [],
        }

        this.config = {
            prefix: 'myka.',
            owners: ['452618703792766987', '343778106340802580'],
        }

        this.cases = 0;
    }
    
    private async _loadEvents(): Promise<Event[]> {
        const regex = /^(.*)Event\.(t|j)s$/;
        let events = fs.readdirSync(__dirname + '/../events').filter(file => regex.test(file));
        for (let event of events) {
            logger.info(`Loading event ${event.replace(regex, '$1Event')}`, { label: `Client, Event Loader` });

            let { default: base } = require(__dirname + `/../events/${event}`);
            
            const instance = new base(this) as Event;

            this.events.push(instance);

            this.on(instance.eventName, (...args) => instance.run? instance.run(...args) : logger.warn(`Event ${instance.eventName} has no run function.`, { label: `Client, Event Loader`, error: true }));
        };

        logger.info(`Loaded ${this.events.length} events of ${events.length}`, { label: `Client, Event Loader` });

        return this.events;
    }

    private async _loadCommandsv2(): Promise<IClientCommands> {
        const fileRegex = /^(.*)(Command|SubCommand|CommandGroup)(\.(j|t)s)?$/;
        
        let types = fs.readdirSync(__dirname + '/../commands') as Array<'slash' | 'vanilla' | 'user'>;

        for (let type of types) {
            let categeries = fs.readdirSync(`${__dirname}/../commands/${type}`);

            for (let category of categeries) {
                let commands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}`).filter(file => fileRegex.test(file));

                for (let command of commands) {
                    if(fs.lstatSync(`${__dirname}/../commands/${type}/${category}/${command}`).isDirectory()) {
                        const client = this;
                        const _Command = require(`${__dirname}/Command`);
                        let _command: Command = this.commands[type].find(cmd => cmd.name === splitCommandName(command)) || eval(`new (class ${command.replace(fileRegex, '$1$2')} extends _Command.default { constructor() { 
                                super(client, { 
                                    name: '${splitCommandName(command)}', 
                                }) 
                            } 
                        })`)

                        if(!this.commands[type].find(cmd => cmd.name === splitCommandName(command))) {
                            this.commands[type].push(_command);
                        }

                        if(!_command.subcommands?.length) { _command.subcommands = []; }

                        let subcommands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}/${command}`).filter(file => fileRegex.test(file));;

                        for (let subcommand of subcommands) {
                            if(fs.lstatSync(`${__dirname}/../commands/${type}/${category}/${command}/${subcommand}`).isDirectory()) {
                                let _subcommand: CommandGroup = _command.subcommands.find(cmd => cmd.name === splitCommandName(subcommand)) as CommandGroup || eval(`new (class ${subcommand.replace(fileRegex, '$1$2')} extends _Command.CommandGroup { constructor() { 
                                    super(client, { 
                                        name: '${splitCommandName(subcommand)}', 
                                    }, _command) 
                                } 
                            })`)

                                let subsubcommands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}/${command}/${subcommand}`).filter(file => fileRegex.test(file));;

                                for (let subsubcommand of subsubcommands) {
                                    let { default: base } = require(__dirname + `/../commands/${type}/${category}/${command}/${subcommand}/${subsubcommand}`);

                                    logger.info(`Loading ${type} command ${subsubcommand.replace(fileRegex, '$1$2')} for command group ${subcommand.replace(fileRegex, '$1$2')} on command ${command.replace(fileRegex, '$1$2')}`, { label: `Client, Commands Loader` });

                                    const instance  = new base(this, _subcommand) as SubCommand;

                                    _subcommand.subcommands.push(instance);
                                }

                                _command.subcommands.push(_subcommand);
                            } else {
                                let { default: base } = require(__dirname + `/../commands/${type}/${category}/${command}/${subcommand}`);
                                logger.info(`Loading ${type} command ${subcommand.replace(fileRegex, '$1$2')} on command ${command.replace(fileRegex, '$1$2')}`, { label: `Client, Commands Loader` });
                                const instance  = new base(this, _command) as SubCommand;

                                _command.subcommands.push(instance);
                            }
                        }
                    } else {
                        let { default: base } = require(`${__dirname}/../commands/${type}/${category}/${command}`);

                        logger.info(`Loading ${type} command ${command.replace(fileRegex, '$1$2')}`, { label: `Client, Commands Loader` });
                        
                        const instance  = new base(this) as Command;

                        this.commands[type].push(instance);
                    }
                }
            }
        }

        return this.commands;

        function splitCommandName(name: string) {
            let split = name.replace(fileRegex, '$1').match(/[A-Z][a-z]*/g) as string[];

            return split[split.length - 1].toLowerCase();
        }
    }

    public async init(): Promise<void> {
        await this._loadEvents();
        await this._loadCommandsv2();
        await this.connect();
    }
};

export default Client;