import { channel } from "./channel";

export class account {

    address: any;
    balance: any;
    channels: channel[];

    constructor(address, balance) {
        this.address = address;
        this.balance = balance;
        this.channels = [];
    }

    pushChannel(channel: channel) {
        this.channels.push(channel);
    }

}