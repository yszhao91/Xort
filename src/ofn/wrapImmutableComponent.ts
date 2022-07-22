const proxyMap = new WeakMap();

const proxyHandler = {
    set(target: { constructor: { getName: () => any; }; }, prop: any) {
        throw new Error(
            `Tried to write to "${target.constructor.getName()}#${String(
                prop
            )}" on immutable component. Use .getMutableComponent() to modify a component.`
        );
    },
};

/**
 * 包裹成不可变的组件
 * @param component 
 * @returns 
 */
export default function wrapImmutableComponent(T?: any, component?: object) {
    if (component === undefined) {
        return undefined;
    }

    let wrappedComponent = proxyMap.get(component);

    if (!wrappedComponent) {
        wrappedComponent = new Proxy(component, proxyHandler);
        proxyMap.set(component, wrappedComponent);
    }

    return wrappedComponent;
}
