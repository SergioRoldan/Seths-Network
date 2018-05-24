const Web3Utils = require('web3-utils');

export class channel {

    address: any;
    farEnd: any;
    nearEnd: any; 
    value: any;
    endDate: any;

    accepted: any;
    closed: any;

    farEndValue: any;
    nearEndValue: any;
    id: any;

    randoms: any[];
    hashes: any[];

    constructor(address, nearEnd, farEnd, value, endDate, farEndValue, nearEndValue, accepted = false, id = 0, closed = false) {
        this.address = address;
        this.nearEnd = nearEnd;
        this.farEnd = farEnd;
        this.value = value;
        this.endDate = new Date(Number(endDate)*1000);
        this.accepted = accepted;
        this.farEndValue = farEndValue;
        this.nearEndValue = nearEndValue;
        this.id = id;
        this.randoms = [];
        this.hashes = [];
        this.closed = closed;
    }

    setAccepted() {
        this.accepted = true;
    }

    setClosed() {
        this.closed = true;
    }

    updateId(id: any) {
        this.id = id;
    }

    addRandomLock(random: any) {
        this.randoms.push(random);
    }

    addHashLock(hash: any) {
        this.hashes.push(hash);
    }

    checkRandomHashesInH(random: any) {
        let h = Web3Utils.soliditySha3(
            { t: 'bytes32', v: random}
        );

        return this.hashes.includes(h);
    }

}