import { account } from "./account";
const Web3Utils = require('web3-utils');


export class updateParams {
    end_chann: any[];
    values_id: any[];

    web3Utils: any = Web3Utils;

    web3: any;

    v: any;
    r_s: any[];

    rsSigned: any[];
    rs: any[];
    hs: any[];
    ttls: any[];
    rhVals: any[];
    ends: any[];

    constructor(web3, end, chann, values, id, signature, rs = [], ttls = [], rhVals = [], ends = [], rsSigned = []) {
        this.web3 = web3;
        
        this.end_chann = [end, chann];
        this.values_id = [this.web3.utils.toWei(values.toString(), 'ether'), id];

        this.rs = rs;
        this.hs = [];
        if(rs.length > 0) {
            this.generateHashes(rs);
            this.ttls = ttls;
            this.rhVals = [];
            this.ends = ends;
            this.rsSigned = rsSigned;

            for(let v of rhVals) 
                this.rhVals.push(this.web3.utils.toWei(v, 'ether'));

        } else {
            this.rhVals = [];
            this.ttls = ttls;
            this.ends = ends;
            this.rsSigned = rsSigned;
        }
        
        if(signature == null || signature == '') {
            this.generateSignature().then(res => {
                signature = res

                let tmp = this.parseSignature(signature);

                this.v = tmp['v'];
                this.r_s = [tmp['r'], tmp['s']];
             });
        } else {
            let tmp = this.parseSignature(signature);

            this.v = tmp['v'];
            this.r_s = [tmp['r'], tmp['s']];
        }

    }

    generateSignature() {
        if(this.hs.length == 0) {
            let hsh = this.web3Utils.soliditySha3(
                { t: 'uint256', v: this.values_id },
                { t: 'address', v: this.end_chann }
            );
            
            return this.web3.eth.sign(hsh, this.end_chann[0]);
        } else {
            console.log(this.hs, this.ttls, this.rhVals, this.ends);

            let hsh = this.web3Utils.soliditySha3(
                { t: 'uint256', v: this.values_id },
                { t: 'address', v: this.end_chann },
                { t: 'bytes32', v: this.rsSigned },
                { t: 'bytes32', v: this.hs },
                { t: 'uint256', v: this.ttls },
                { t: 'uint256', v: this.rhVals },
                { t: 'uint256', v: this.ends }
            );

            return this.web3.eth.sign(hsh, this.end_chann[0]);
        }
    }

    parseSignature(signature: any): any {
        
        let sign = signature.substring(2);
        let r = '0x' + sign.slice(0, 64);
        let s = '0x' + sign.slice(64, 128);
        let v = '0x' + sign.slice(128, 130);
        let v_dec = this.web3.utils.hexToNumber(v) + 27;

        return {'r': r, 's': s, 'v': v_dec};
    }

    generateHashes(randoms: any) {
        for(let rand of randoms) {
            let h = this.web3Utils.soliditySha3(
                { t: 'bytes32', v: rand }
            );
            this.hs.push(h);
        }
    }
    
 }