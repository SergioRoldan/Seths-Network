export class channel {

    address: any;
    farEnd: any;
    nearEnd: any; 
    value: any;
    endDate: any;

    constructor(address, nearEnd, farEnd, value, endDate) {
        this.address = address;
        this.nearEnd = nearEnd;
        this.farEnd = farEnd;
        this.value = value;
        this.endDate = new Date(Number(endDate)*1000);
    }

}