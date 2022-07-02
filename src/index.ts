import 'dotenv/config';
import './utils/Logger';
import Client from './structures/Client';

const client = new Client(
    process.env.DISCORD_TOKEN,
    {
        intents: ['guilds', 'guildMembers', 'guildBans', 'guildIntegrations', 'guildWebhooks', 'guildVoiceStates', 'guildMessages', 'guildMessageReactions'],
        allowedMentions: {
            everyone: false,
            roles: false,
            users: true,
            repliedUser: true,
        },
        restMode: true,
        rest: {
            baseURL: '/api/v10'
        },
        messageLimit: 20,
        defaultImageFormat: 'png',
        defaultImageSize: 1024,
    }
);

client.init();