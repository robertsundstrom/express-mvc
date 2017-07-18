import "reflect-metadata";

export function inject(...rest: any[]) {
    return (target: any) => {
        target.inject = rest;
    };
}

export function autoinject() {
    return (target: any) => {
        const types = Reflect.getMetadata("design:paramtypes", target);
        target.inject = types;
    };
}
