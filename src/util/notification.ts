export class notification {

    message: string;
    origin: string;
    parameters: any;
    objects: any;

    constructor(origin, message, parameters, objects?) {
        this.message = message;
        this.origin = origin;
        this.parameters = parameters;
        this.objects = objects || null;
    }
   
}