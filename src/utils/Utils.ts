import { User, Embed } from 'eris';

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
        }

        return embed;
    }
}

export default Utils;