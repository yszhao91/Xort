import { World as EntityManager } from './world'; 
import { Query } from './query';
import { Entity } from './entity';
import { IStringDictionary } from './types';

export function componentRegistered(T: any) {
    return (
        (typeof T === "object" && T.Component._typeId !== undefined) ||
        (T.isComponent && T._typeId !== undefined)
    );
}

/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */
export function queryKey(Components: any[]) {
    var ids = [];
    for (var n = 0; n < Components.length; n++) {
        var T = Components[n];

        if (!componentRegistered(T)) {
            throw new Error(`Tried to create a query with an unregistered component`);
        }

        if (typeof T === "object") {
            var operator = T.operator === "not" ? "!" : T.operator;
            ids.push(operator + T.Component._typeId);
        } else {
            ids.push(T._typeId);
        }
    }

    return ids.sort().join("-");
}


export class Querymanger {
    //所有的组件组合类型模板
    //由其拥有的组件的唯一标识符索引的查询
    _queryTemps: IStringDictionary<Query> = {};
    constructor(private _entityMgr: EntityManager) {

    }

    onEntityRemoved(entity: Entity) {
        for (var queryName in this._queryTemps) {
            var query = this._queryTemps[queryName];
            if (entity.queries.indexOf(query) !== -1) {
                query.removeEntity(entity);
            }
        }
    }

    /**
     * Callback when a component is added to an entity
     * @param {Entity} entity Entity that just got the new component
     * @param {Component} Component Component added to the entity
     */
    onEntityComponentAdded(entity: Entity, Component: any) {
        // @todo Use bitmask for checking components?

        // Check each indexed query to see if we need to add this entity to the list
        for (var queryName in this._queryTemps) {
            var query = this._queryTemps[queryName];

            if (
                !!~query.NotComponents.indexOf(Component) &&
                ~query.entities.indexOf(entity)
            ) {
                query.removeEntity(entity);
                continue;
            }

            // Add the entity only if:
            // Component is in the query
            // and Entity has ALL the components of the query
            // and Entity is not already in the query
            if (
                !~query.Components.indexOf(Component) ||
                !query.match(entity) ||
                ~query.entities.indexOf(entity)
            )
                continue;

            query.addEntity(entity);
        }
    }

    /**
     * Callback when a component is removed from an entity
     * @param {Entity} entity Entity to remove the component from
     * @param {Component} Component Component to remove from the entity
     */
    onEntityComponentRemoved(entity: Entity, Component: any) {
        for (var queryName in this._queryTemps) {
            var query = this._queryTemps[queryName];

            if (
                !!~query.NotComponents.indexOf(Component) &&
                !~query.entities.indexOf(entity) &&
                query.match(entity)
            ) {
                query.addEntity(entity);
                continue;
            }

            if (
                !!~query.Components.indexOf(Component) &&
                !!~query.entities.indexOf(entity) &&
                !query.match(entity)
            ) {
                query.removeEntity(entity);
                continue;
            }
        }
    }

    /**
     * 根据组件的组合形式获取或者生产 query  
     * @param {Component} Components Components that the query should have
     */
    getQuery(Components: any): Query { 
        var key = queryKey(Components);
        var query = this._queryTemps[key];
        if (!query) {
            this._queryTemps[key] = query = new Query(Components, this._entityMgr);
        }
        return query;
    }

    /**
     * Return some stats from this class
     */
    stats() {
        var stats: any = {};
        for (var queryName in this._queryTemps) {
            stats[queryName] = this._queryTemps[queryName].stats();
        }
        return stats;
    }

}