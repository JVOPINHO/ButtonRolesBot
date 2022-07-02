import Client from './Client';

class Event {
    public declare client: Client;
    public eventName: string;
    public run?(...args: any[]): void;

    constructor(
        client: Client,
        eventName: string,
    ) {
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
        
        this.eventName = eventName;
    };
};

export default Event;