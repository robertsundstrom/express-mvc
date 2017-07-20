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

export function resolveControllerInstance(controllerType: any) {
    const injectables = controllerType.inject;
    const injectableInstances: any[] = resolveInjectables(injectables);
    return new controllerType(...injectableInstances);
}

export function resolveAction(instance: any, action: string): any {
    return instance[action].bind(instance);
}

export function setControllerContext(controllerInstance: any, req: any, res: any) {
    controllerInstance.req = req;
    controllerInstance.res = res;
}

export function createRouteHandler(action: string, controllerType: any) {
    return async (req: express.Request, res: express.Response) => {
        const controllerInstance = resolveControllerInstance(controllerType);
        const a = resolveAction(controllerInstance, action);
        setControllerContext(controllerInstance, req, res);
        const params = Object.values(req.params);
        const data = req.body;
        try {
            const response = await a(...params, data);
            // If server response
            // If else send content
            if (typeof response !== "undefined" && (typeof response === "string" || !("_write" in response))) {
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

function readdirSync(dir: string) {
    function walkSync(dir2: string, filelist?: string[]) {
        // tslint:disable-next-line:one-variable-per-declaration
        const files = fs.readdirSync(dir2);
        filelist = filelist || [];
        const relativeDir = path.relative(dir, dir2);
        files.forEach((file) => {
            if (fs.statSync(dir2 + "/" + file).isDirectory()) {
                filelist = walkSync(dir2 + "/" + file, filelist);
            } else {
                const filePath = path.join(relativeDir, file);
                filelist.push(filePath);
            }
        });
        return filelist;
    }
    return walkSync(dir);
}

const controllers: any = {};

function loadControllers() {
    for (let controllerFile of readdirSync(controllerDir)) {
        if (path.extname(controllerFile) !== ".js") {
            continue;
        }
        controllerFile = controllerFile.replace(".js", "");
        const controllerFilePath = path.resolve(controllerDir, controllerFile);
        const module = require(controllerFilePath);
        const controllerType = module.default;
        const controllerTypeName = controllerType.name;
        controllers[controllerFile /* controllerTypeName */] = controllerType;
    }
}

function registerDecoratorRoutes(router: any, controllerType: any) {
    const prototype = controllerType.prototype;
    for (let routeKey in prototype.routes) {
        if (typeof routeKey === "string") {
            const routes = prototype.routes[routeKey];
            for (const route of routes) {
                const handler = createRouteHandler(route.action, controllerType);
                if (routeKey === "/") {
                    // Default to controller route.
                    routeKey = "";
                } else if (routeKey !== "/" && !routeKey.startsWith("/")) {
                    // Action route not starting with "/". Potentially just a parameter placeholder.
                    routeKey = "/" + routeKey;
                }
                const controllerRoute = controllerType.route;
                const routePath = controllerRoute + routeKey;
                // console.log(route.method, routePath);
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
}

export function mapRoute(app: express.Application, name: string, template: string, defaults: any) {
    app.get(template, async (req: express.Request, res: express.Response) => {
        const { action, controller } = req.params;
        const routeHandler = createRouteHandler(action, controller);
        await routeHandler(req, res);
    });
    if (defaults) {
        app.get("/", async (req: express.Request, res: express.Response) => {
            const { action, controller } = defaults;
            const controllerType = controllers[controller];
            const routeHandler = createRouteHandler(action, controllerType);
            await routeHandler(req, res);
        });
    }
}

export function useMvc(app: express.Application) {
    const router = app;
    loadControllers();
    for (const controllerType of Object.values(controllers)) {
        registerDecoratorRoutes(router, controllerType);
    }
}
