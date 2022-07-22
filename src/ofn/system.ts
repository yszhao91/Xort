import { World } from './world';
import { IStringDictionary } from '../cga/utils/types';
import { Query, QueryAction } from './query';
import { componentRegistered } from './queryManager';
import { ITimer } from './utils/timer';

export interface ISystemQuery {
    components: any[],
    mandatory?: boolean,
    listen?: {
        added?: boolean,
        removed?: boolean,
        changed?: boolean | any[],
    },
}

export abstract class System {
    static isSystem = true;
    /**
     * 用来关联需要用来的组件类
     */
    static queries: IStringDictionary<ISystemQuery> = {};

    enabled: boolean = true;
    private _mandatoryQueries: Array<any> = [];
    initialized: boolean = false;
    private _queries: IStringDictionary<Query> = {};
    queriesEntity: IStringDictionary<{ results: any }> = {};
    priority: number = 0;
    order: number = 0;
    _queriesEntity: any = {};

    constructor(protected world: World, attributes: any) {
        const comClass: any = this.constructor;

        if (comClass.queries) {
            console.log(comClass);
            for (var queryName in comClass.queries) {
                var oneQuery: ISystemQuery = comClass.queries[queryName];
                console.log(oneQuery);

                var Components = oneQuery.components;
                if (!Components || Components.length === 0) {
                    throw new Error("query中的<components>属性不能为空");
                }

                const unregisteredComponents = Components.filter(
                    (Component) => !componentRegistered(Component)
                );

                if (unregisteredComponents.length > 0) {
                    //存在未注册的组件
                    throw new Error(
                        ` <${this.constructor.name}.${queryName}>为未注册<[${unregisteredComponents.map((c) => c.getName()).join(", ")}]>创建查询!`
                    );
                }

                const query = this.world.entityManager.queryComponents(Components);
                this._queries[queryName] = query;

                if (oneQuery.mandatory === true) {
                    this._mandatoryQueries.push(query);
                }

                this._queriesEntity[queryName] = {
                    results: query.entities
                }

                if (oneQuery.listen) {
                    for (const eventName in QueryAction) {

                        if (!this.execute) {
                            console.warn(
                                `System <'>${this.getName()}> has defined listen events (${[...(QueryAction as any)].join(
                                    ", "
                                )}) for query '${queryName}' but it does not implement the 'execute' method.`
                            );
                        }

                        if ((oneQuery.listen as any)[eventName]) {
                            let eventAction = (oneQuery.listen as any).listen[eventName];
                            if (eventName === QueryAction.COMPONENT_CHANGED) {
                                query.reactive = true;
                                if (eventAction === true) {
                                    this.world.fire(QueryAction.COMPONENT_CHANGED)
                                }
                            }
                        }
                    }
                }
            }
        }

        if (attributes && attributes.priority) {
            this.priority = attributes.priority;
        }

        this.initialized = true;
    }

    get queries() {
        return this._queries;
    }

    abstract execute(timer: ITimer): any;

    /**
     * 注册的时候调用
     */
    init?: (attributes: any) => any

    stop() {
        this.enabled = false;
    }

    play() {
        this.enabled = true;
    }

    getName() {
        return this.constructor.name;
    }

    canExecute() {
        if (this._mandatoryQueries.length === 0) return true;

        for (let i = 0; i < this._mandatoryQueries.length; i++) {
            var query = this._mandatoryQueries[i];
            if (query.entities.length === 0) {
                return false;
            }
        }

        return true;
    }


    clearEvents() {
        for (let queryName in this.queries) {
            // var query = this.queries[queryName];
            // if (query.added) {
            //     query.added.length = 0;
            // }
            // if (query.removed) {
            //     query.removed.length = 0;
            // }
            // if (query.changed) {
            //     if (Array.isArray(query.changed)) {
            //         query.changed.length = 0;
            //     } else {
            //         for (let name in query.changed) {
            //             query.changed[name].length = 0;
            //         }
            //     }
            // }
        }
    }

}