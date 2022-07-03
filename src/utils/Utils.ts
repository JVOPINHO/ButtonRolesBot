import { User, Embed } from 'eris';

import { Colors } from './Contants';

class Utils {
    public static embedError(message: string, user?: User): Embed {
        const embed = {
            color: 15548997,
            description: message,
        } as Embed;

        if(user) {
            embed.footer = {
                text: `${user.username}#${user.discriminator}`,
                icon_url: user.dynamicAvatarURL(),
            }
            embed.timestamp = new Date(); 
        }

        return embed;
    }

    public static resolveColor(color: string|number|Array<number>) {
        if (typeof color === 'string') {
            if (color === 'Random') return Math.floor(Math.random() * (0xffffff + 1));
            if (color === 'Default') return 0;
            return (Colors as any)[color] ?? parseInt(color.replace('#', ''), 16);
        } else if (Array.isArray(color)) {
            return (color[0] << 16) + (color[1] << 8) + color[2];
        }
    }
}

export default Utils;