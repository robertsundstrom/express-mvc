export function get(route: string) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        if (!("routes" in target)) {
            target.routes = {};
        }
        let routes = target.routes[route];
        if (typeof routes === "undefined") {
            routes = [];
            target.routes[route] = routes;
        }
        routes.push({
            action: key,
            method: "get",
        });
    };
}
