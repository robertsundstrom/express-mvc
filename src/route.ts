export function route(path: string) {
    return (target: any) => {
        target.route = path;
    };
}
