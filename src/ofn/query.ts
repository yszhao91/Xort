import { Entity } from './entity';
import { EventHandler } from '../cga/render/eventhandler';
import { queryKey } from './queryManager';
export enum QueryAction {
    ENTITY_ADDED = "Query#ENTITY_ADDED",
    ENTITY_REMOVED = "Query#ENTITY_REMOVED",
    COMPONENT_CHANGED = "Query#COMPONENT_CHANGED"
}
export class Query extends EventHandler {
    reactive: boolean = false;
    key: string;

    Components: any[] = [];
    NotComponents: any[] = [];
    entities: any[] = [];
    constructor(Components: any, manager: any) {
        super();
        Components.forEach((component: any) => {
            if (typeof component === "object") {
                this.NotComponents.push(component.Component);
            } else {
                this.Components.push(component);
            }
        });

        if (this.Components.length === 0) {
            throw new Error("没有组件不能创建query");
        }

        this.entities = []; 

        // This query is being used by a reactive system
        this.reactive = false;

        this.key = queryKey(Components);

        // Fill the query with the existing entities
        for (var i = 0; i < manager._entities.length; i++) {
            var entity = manager._entities[i];
            if (this.match(entity)) {
                // @todo ??? this.addEntity(entity); => preventing the event to be generated
                entity.queries.push(this);
                this.entities.push(entity);
            }
        }
    }

    /**
     * Add entity to this query
     * @param {Entity} entity
     */
    addEntity(entity: Entity) {
        entity.queries.push(this);
        this.entities.push(entity);

        this.fire(QueryAction.ENTITY_ADDED, entity);
    }

    /**
     * Remove entity from this query
     * @param {Entity} entity
     */
    removeEntity(entity: Entity) {
        let index = this.entities.indexOf(entity);
        if (~index) {
            this.entities.splice(index, 1);

            index = entity.queries.indexOf(this);
            entity.queries.splice(index, 1);

            this.fire(QueryAction.ENTITY_REMOVED, entity);
        }
    }

    /**
     * 检查组件和实体是否还匹配（可能会修改  导致不匹配）
     * @param entity 
     * @returns 
     */
    match(entity: Entity) {
        return (
            entity.hasAllComponents(this.Components) &&
            !entity.hasAnyComponents(this.NotComponents)
        );
    }

    stats(): any {
        throw new Error('Method not implemented.');
    } 
}