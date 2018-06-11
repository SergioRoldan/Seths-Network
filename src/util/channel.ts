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
    ttls: any[];
    rhvals: any[];
    direction: any[];

    rsShowed: any[];

    lastBlockScr: number;

    //Conctructor overload to create non-initialized channels
    constructor();
    constructor(address, nearEnd, farEnd, value, endDate, nearEndValue, farEndValue);
    constructor(address?, nearEnd?, farEnd?, value?, endDate?, nearEndValue?, farEndValue?, lastBlockScr = 0, accepted = false, id = 0, closed = false) {
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
        this.lastBlockScr = lastBlockScr;
    }

    //Setters
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

    //Get Randoms shown
    getRsShowed(rsShowed: any) {
        //Check if randoms is empty
        if(this.randoms.length >0) {
            //If it's not, check that each random hashed in hash
            for (let r of rsShowed) {
                let index = this.checkRandomHashesInH(r);
                if (index != -1)
                    this.rsShowed.push(index);
            }
            //Regenerate hashes consumed by checkRadomHashesInH
            this.generateHashes(this.randoms);
        } else {
            //If it is, generate hashes
            this.generateHashes(rsShowed);
            this.randoms = rsShowed;

            //Check that each random hashes in hash
            for (let r of rsShowed) {
                let index = this.checkRandomHashesInH(r);
                if (index != -1)
                    this.rsShowed.push(index);
            }
            //Regenerate hashes consumed by checkRadomHashesInH
            this.generateHashes(this.randoms);
            
        }
        
    }

    //Generate hashes from randoms using solidity hashing function sha3 which is a synonim of kecakk256
    generateHashes(randoms: any) {
        this.hashes = [];

        for (let rand of randoms) {
            let h = Web3Utils.soliditySha3(
                { t: 'bytes32', v: rand }
            );
            this.hashes.push(h);
        }
    }

    //Check that a random R hashes in H and consumes the hash to increase performance
    checkRandomHashesInH(random: any): any {
        let h = Web3Utils.soliditySha3(
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

    //updates the channel according to an update parameters
    paramToChann(param: any) {
        this.hashes = param.hs;
        this.randoms = param.rs;
        this.ttls = param.ttls;
        this.direction = param.ends;
        this.rhvals = param.rhVals;
    }

    //Map a js object to channel
    map(object) {
        this.address = object.address;
        this.nearEnd = object.nearEnd;
        this.farEnd = object.farEnd;
        this.value = object.value;
        this.endDate = object.endDate;
        this.accepted = object.accepted;
        this.farEndValue = object.farEndValue;
        this.nearEndValue = object.nearEndValue;
        this.id = object.id;
        this.randoms = object.randoms;
        this.hashes = object.hashes;
        this.ttls = object.ttls;
        this.rhvals = object.rhvals;
        this.rsShowed = object.rsShowed;
        this.direction = object.direction;
        this.closed = object.closed;
        this.lastBlockScr = object.lastBlockScr;
    }

}