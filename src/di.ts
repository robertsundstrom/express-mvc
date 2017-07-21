export function inject<T>(type: any, dependencies?: any[]): any {
    dependencies = dependencies || [];
    return new type(...dependencies);
}
