export class error {

    origin: string;
    message: string;
    object: any;

    constructor(origin, message, object) {
        this.origin = origin;
        this.message = message;
        this.object = object;
    }
   
}