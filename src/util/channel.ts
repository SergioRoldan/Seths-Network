const Web3Utils = require('web3-utils');

export class channel {

    address: any;
    farEnd: any;
    nearEnd: any; 
    value: any;
    endDate: any;

    web3Utils: any = Web3Utils;

    accepted: any;
    closed: any;

    farEndValue: any;
    nearEndValue: any;
    id: any;

    randoms: any[];
    hashes: any[];
    ttls: any[];
    rhvals: any[];
    direction: any[];

    rsShowed: any[];

    constructor(address, nearEnd, farEnd, value, endDate, nearEndValue, farEndValue, accepted = false, id = 0, closed = false) {
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
        this.ttls = [];
        this.rhvals = [];
        this.rsShowed = [];
        this.direction = [];
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

    getRsShowed(rsShowed: any) {
        if(this.randoms.length >0) {
            for (let r of rsShowed) {
                let index = this.checkRandomHashesInH(r);
                if (index != -1)
                    this.rsShowed.push(index);
            }
            this.generateHashes(this.randoms);
        } else {
            this.generateHashes(rsShowed);
            this.randoms = rsShowed;

            for (let r of rsShowed) {
                let index = this.checkRandomHashesInH(r);
                if (index != -1)
                    this.rsShowed.push(index);
            }
            
            this.generateHashes(this.randoms);
            
        }
        
    }

    generateHashes(randoms: any) {
        this.hashes = [];

        for (let rand of randoms) {
            let h = this.web3Utils.soliditySha3(
                { t: 'bytes32', v: rand }
            );
            this.hashes.push(h);
        }
    }

    checkRandomHashesInH(random: any): any {
        let h = this.web3Utils.soliditySha3(
            { t: 'bytes32', v: random}
        );

        console.log(this.hashes, h, this.randoms);

        let found = -1;

        for(let i = 0; i < this.randoms.length && found == -1; i++) 
            if(h == this.hashes[i]) {
                found = i;
                delete this.hashes[i];
            }
                
        return found;
    }

    paramToChann(param: any) {
        this.hashes = param.hs;
        this.randoms = param.rs;
        this.ttls = param.ttls;
        this.direction = param.ends;
        this.rhvals = param.rhVals;
    }

}