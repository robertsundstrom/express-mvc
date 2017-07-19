export function route(path: string) {
    return (target: any) => {
        path = path.replace(":controller", target.name);
        target.route = path;
    };
}
