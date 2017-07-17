export function inject(...rest: any[]) {
    return (target: any) => {
        target.inject = rest;
    };
}
