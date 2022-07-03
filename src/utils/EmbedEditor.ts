import { ComponentInteraction, Constants, Embed, InteractionEditContent, MessageContent, ModalSubmitInteraction, SelectMenuOptions, TextableChannel, TextInput, User } from 'eris';
import { ObjectManager } from 'sydb';

import Utils from './Utils';
import { EmbedInputLimits } from './Contants';
import InteractionCollector from './collector/Interaction';

const options: Array<SelectMenuOptions> = [
    {
        label: 'Title',
        value: 'title',
    },
    {
        label: 'Description',
        value: 'description',
    },
    {
        label: 'Color',
        value: 'color',
    },
    {
        label: 'Image',
        value: 'image',
    },
    {
        label: 'Thumbnail',
        value: 'thumbnail',
    },
    {
        label: 'Author',
        value: 'author',
    },
    {
        label: 'Footer',
        value: 'footer',
    },
    {
        label: 'Fields',
        value: 'fields',
    }
];

const objmOptions = { split: '#' }

class EmbedEditor {
    public client: Client;
    public user: User;
    public channel: TextableChannel;
    public raw = new ObjectManager({});
    public id: string;

    constructor(client: Client, user: User, channel: TextableChannel, raw: Embed = {} as Embed) {
        this.client = client;
        this.user = user;
        this.channel = channel;

        this.raw.data = raw;

        this.id = shuffleArray([ ...Date.now().toString(16) + Math.floor(Math.random() * 16777215).toString(16) + Math.floor(Math.random() * 16777215).toString(16) ]).join('');
    }

    public message(): MessageContent {
        const message: MessageContent = {
            embeds: [
                {
                    color: 16705372,
                    title: 'Embed Generator',
                    description: 'Select below which embed property you want to edit.\nWhen editing the first property you will get a preview.\n\nTo remove a property from the embed simply pass nothing.',
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: `${this.id}-selectEmbedField`,
                            options,
                        }
                    ]
                }
            ]
        }
        
        const rawEmbed: Embed = this.raw.data as Embed;

        if(Object.keys(rawEmbed).length) (message.embeds as Array<Embed>).push(rawEmbed);

        return message;
    }

    public init(editMessageFn: (content: InteractionEditContent, ...args: any[]) => Promise<any>) {
        const collector = new InteractionCollector(this.client, {
            time: 10 * 1000 * 60,
            user: this.user,
            filter: (interaction: ComponentInteraction) => interaction.data.custom_id?.startsWith(`${this.id}-`)
        });

        collector.on('collect', (interaction: ComponentInteraction|ModalSubmitInteraction) => {
            const id = interaction.data.custom_id.split('-')[1];
            
            if(interaction.type == 3) {
                if(interaction.data.component_type == 3) {
                    const value = interaction.data.values[0];
    
                    switch(id) {
                        case 'selectEmbedField': {
                            let charLimit: number;
        
                            let textInputs: Array<TextInput> = [
                                {
                                    type: 4,
                                    custom_id: value,
                                    label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
                                    style: Constants.TextInputStyles.SHORT,
                                    value: this.raw.get(value, objmOptions),
                                    required: false,
                                    min_length: 0,
                                    max_length: (EmbedInputLimits as any)[value],
                                }
                            ];

                            if(value == 'color' && textInputs[0].value) {
                                textInputs[0].value = Number(textInputs[0].value).toString(16);
                            }

                            if(['description'].includes(value)) {
                                textInputs[0].style = Constants.TextInputStyles.PARAGRAPH;
                            }
        
                            if(['thumbnail', 'image'].includes(value)) {
                                textInputs[0] = {
                                    ...textInputs[0],
                                    custom_id: `${value}#url`,
                                    label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() + `${value == ' thumbnail' ? 'image' : ''} url`,
                                    value: this.raw.get(`${value}#url`, objmOptions),
                                    max_length: 4000,
                                };
                            }
        
                            if(['author', 'footer'].includes(value)) {
                                const textOrName = value == 'author' ? 'name' : 'text';
    
                                textInputs[0] = {
                                    ...textInputs[0],
                                    custom_id: `${value}#${textOrName}`,
                                    label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() + ` ${textOrName}`,
                                    value: this.raw.get(`${value}#${textOrName}`, objmOptions),
                                    max_length: (EmbedInputLimits as any)[`${value}${textOrName.charAt(0).toUpperCase() + textOrName.slice(1).toLowerCase()}`] as number,
                                };
    
                                textInputs.push(
                                    {
                                        type: 4,
                                        custom_id: `${value}#icon_url`,
                                        label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() + ` icon url`,
                                        style: Constants.TextInputStyles.SHORT,
                                        value: this.raw.get(`${value}#icon_url`, objmOptions),
                                        required: false,
                                        min_length: 0,
                                        max_length: 4000,
                                    }
                                )
    
                                if(value == 'author') {
                                    textInputs.push(
                                        {
                                            type: 4,
                                            custom_id: `${value}#url`,
                                            label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() + ` url`,
                                            style: Constants.TextInputStyles.SHORT,
                                            value: this.raw.get(`${value}#url`, objmOptions),
                                            required: false,
                                            min_length: 0,
                                            max_length: 4000,
                                        }
                                    )
                                }
                            }
    
                            interaction.createModal({
                                title: `Create Modal (${value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()})`,
                                components: textInputs.map(textInput => ({
                                    type: 1,
                                    components: [textInput]
                                })),
                                custom_id: `${this.id}-editEmbedField`,
                            });
                        }
                    }
                }
            }

            if(interaction.type == 5) {
                const textInputs: Array<Pick<TextInput, "custom_id" | "type"> & {
                    value: string;
                }> = [];

                interaction.data.components.map(row => row.components.map(input => textInputs.push(input)));

                console.log(textInputs);

                textInputs.forEach(input => {
                    const ref = input.custom_id;

                    if(!input.value) this.raw.delete(ref, objmOptions);
                    else {
                        console.log(ref == 'color' ? Utils.resolveColor(input.value) : input.value);
                        this.raw.set(ref, ref == 'color' ? Utils.resolveColor(input.value) : input.value, objmOptions);
                    }
                });

                interaction.editParent(this.message() as any)
            }
        })
    }

}

export default EmbedEditor;

function shuffleArray(array: Array<any>) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}