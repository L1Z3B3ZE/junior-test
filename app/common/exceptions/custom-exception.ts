export class CustomException extends Error {
    public status: number;
    public error: string;
    public result: any;
    public publicMessage?: any;

    constructor(status: number, error: string, result?: any) {
        super(error);
        this.status = status;
        this.error = error;

        if (result && result.publicMessage) {
            if (typeof result.publicMessage === "string") {
                this.publicMessage = { message: result.publicMessage };
            } else {
                this.publicMessage = result.publicMessage;
            }

            delete result.publicMessage;
        }

        this.result = result;
        Object.setPrototypeOf(this, CustomException.prototype);
    }
}
