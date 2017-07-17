import * as express from "express";

export class Controller {
    public res: express.Response;
    public req: express.Request;

    public render(name: string, data?: any) {
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

    public send(body: any): express.Response {
        return this.res.send(body);
    }

    public sendFile(path: string, options?: any): Promise<void> {
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
