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

    constructor(web3, end, chann, values, id, signature, rsSigned = [], rs = [], hs = [], ttls = [], rhVals = [], ends = []) {
        this.web3 = web3;
        
        this.end_chann = [end, chann];
        this.values_id = [values, id];

        this.rsSigned = rsSigned;
        this.rs = rs;
        this.hs = hs;
        this.ttls = ttls;
        this.rhVals = rhVals;
        this.ends = ends;
        
        if(signature == null || signature == '') 
            signature = this.generateSignature();

        let tmp = this.parseSignature(signature);

        this.v = tmp['v'];
        this.r_s = [tmp['r'], tmp['s']];

    }

    generateSignature() {
        if(this.hs.length == 0) {
            let hsh = this.web3Utils.soliditySha3(
                { t: 'uint256', v: this.values_id },
                { t: 'address', v: this.end_chann }
            );

            console.log(hsh);
            console.log(this.end_chann);
            
            return this.web3.eth.sign(hsh, this.end_chann[0]);
        }
    }

    parseSignature(signature: string): any {
        console.log(signature.valueOf());
        
        let sign = signature.substring(2);
        let r = '0x' + sign.slice(0, 64);
        let s = '0x' + sign.slice(64, 128);
        let v = '0x' + sign.slice(128, 130);
        let v_dec = this.web3.toDecimal(v) + 27;

        return {'r': r, 's': s, 'v': v_dec};
    }
}