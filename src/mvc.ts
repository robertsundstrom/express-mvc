import * as express from "express";
import * as fs from "fs";
import * as path from "path";

function resolveInjectables(injectables: any[]): any[] {
    const injectableInstances: any[] = [];
    if (injectables) {
        for (const injectable of injectables) {
            const injectableInstance = new injectable();
            injectableInstances.push(injectableInstance);
        }
    }
    return injectableInstances;
}

const appDir = path.dirname(require.main!.filename);

export const controllerDir = path.resolve(appDir, "controller");

export function createHandler(route: any, controllerType: any, injectables: any[]) {
    return async (req: express.Request, res: express.Response) => {
        const injectableInstances: any[] = resolveInjectables(injectables);
        const instance = new controllerType(...injectableInstances);
        instance.req = req;
        instance.res = res;
        const params = Object.values(req.params);
        const query = req.query;
        const data = req.body;
        const action = instance[route.action].bind(instance);
        try {
            const response = await action(...params, data);
            // If server response
            // If else send content

            if (typeof response === "string" || !("_write" in response)) {
                res.contentType("application/json");
                res.send(JSON.stringify(response));
            }
            res.end();

        } catch (err) {
            // only in dev
            res.send(err.stack);
            res.end();
            // res.sendStatus(500);
        }
    };
}

export function useMvc(app: express.Application) {
    for (const controllerFile of fs.readdirSync(controllerDir)) {
        if (path.extname(controllerFile) !== ".js") {
            continue;
        }
        const controllerFilePath = path.resolve(controllerDir, controllerFile);
        const module = require(controllerFilePath);
        const controllerType = module.default;
        const injectables = controllerType.inject;
        const prototype = controllerType.prototype;

        // const router = express.Router();
        const router = app;

        for (let routeKey in prototype.routes) {
            if (typeof routeKey === "string") {
                const routes = prototype.routes[routeKey];
                for (const route of routes) {
                    const handler = createHandler(route, controllerType, injectables);
                    if (routeKey === "/") {
                        routeKey = "";
                    }
                    const routePath = controllerType.route + routeKey;
                    switch (route.method) {
                        case "get":
                            router.get(routePath, handler);
                            break;
                        case "post":
                            router.post(routePath, handler);
                            break;
                        case "put":
                            router.put(routePath, handler);
                            break;
                        case "delete":
                            router.delete(routePath, handler);
                            break;
                    }
                }
            }
        }
        // app.use(controllerType.route, router);
    }
}

// "{controller}/{action}/{id}".match(/\{(.*?)\}/g);
