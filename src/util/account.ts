import { channel } from "./channel";

export class account {

    address: any;
    balance: any;
    channels: channel[];
    lastBlockScr: number;

    constructor();
    constructor(address, account);
    constructor(address?, balance?) {
        this.address = address;
        this.balance = balance;
        this.channels = [];
        this.lastBlockScr = 0;
    }

    pushChannel(channel: channel) {
        this.channels.push(channel);
    }

    map(object) {
        this.address = object.address;
        this.balance = object.balance;
        this.channels = object.channels;
        this.lastBlockScr = object.lastBlockScr;
    }

}