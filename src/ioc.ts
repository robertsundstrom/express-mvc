import { inject } from "./di";

interface IEntry {
    type: any;
    scope: DependencyScope;
    factory?: () => any;
    instances: any[];
}

export enum DependencyScope {
    singleton,
    transient,
}

const container: IEntry[] = [];
const defaultLifetime = DependencyScope.singleton;

export function registerSingleton(type: any) {
    container.push({
        instances: [],
        scope: DependencyScope.singleton,
        type,
    });
}

export function registerTransient(type: any) {
    container.push({
        instances: [],
        scope: DependencyScope.transient,
        type,
    });
}

export function registerFactory<T>(type: any, factory: () => T, scope = DependencyScope.singleton) {
    container.push({
        factory,
        instances: [],
        scope,
        type,
    });
}

function createInstance<T>(type: any) {
    const dependencies = type.inject;
    const dependencyInstances: any[] = [];
    if (dependencies) {
        for (const dependency of dependencies) {
            const dependencyInstance = resolve(dependency);
            dependencyInstances.push(dependencyInstance);
        }
    }
    console.log("New instance of", type);
    return inject(type, dependencyInstances);
}

function resolveInstance<T>(type: any, scope: DependencyScope, instances: any[], factory?: () => T) {
    switch (scope) {
        case DependencyScope.singleton:
            let dependency: T = null!;
            if (instances.length > 0) {
                console.log("Fetching instance of", type);
                dependency = instances[0];
            } else {
                if (factory) {
                    dependency = factory();
                } else {
                    dependency = createInstance(type);
                }
                instances.push(dependency);
            }
            return dependency;

        case DependencyScope.transient:
            if (factory) {
                return factory();
            } else {
                return createInstance(type);
            }
    }
}

export function resolve<T>(type: any) {
    let entry = container.find((x) => x.type === type);
    if (typeof entry !== "undefined") {
        return resolveInstance(type, entry.scope, entry.instances, entry.factory);
    } else {
        // if (defaultLifetime === DependencyScope.singleton) {
        // Auto-create entry
        entry = {
            instances: [],
            scope: defaultLifetime, // DependencyScope.singleton,
            type,
        };
        container.push(entry);
        // }
        return resolveInstance(type, defaultLifetime, entry ? entry.instances : []);
    }
}

export function* resolveAll<T>(types: any[]) {
    for (const type of types) {
        yield resolve(type);
    }
}
