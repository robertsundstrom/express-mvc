import * as express from "express";

// tslint:disable-next-line:jsdoc-format
/**
* Represents a Controller. */
export class Controller {
    /**
     * An object representing the HTTP request.
     */
    public res: express.Response;
    /**
     * An object representing the HTTP response.
     */
    public req: express.Request;

    /**
     * Render a view.
     */
    protected render(name: string, data?: any) {
        return new Promise((resolve, reject) => {
            this.res.render(name, data, (error, html) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(html);
                }
            });
        });
    }

    /**
     * Send data back to the client.
     */
    protected send(body: any): express.Response {
        return this.res.send(body);
    }

    /**
     * Send a file back to the client.
     */
    protected sendFile(path: string, options?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.res.sendFile(path, options, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}
