import { channel } from "./channel";

export class account {

    address: any;
    balance: any;
    channels: channel[];

    constructor();
    constructor(address, account);
    constructor(address?, balance?) {
        this.address = address;
        this.balance = balance;
        this.channels = [];
    }

    pushChannel(channel: channel) {
        this.channels.push(channel);
    }

    map(object) {
        this.address = object.address;
        this.balance = object.balance;
        this.channels = object.channels;
    }

}