import { IStringDictionary } from '@/cga/utils/types';
import { ISystemQuery, System } from '../system';
import { ITimer } from '../utils/timer';
import { ScriptComponent, ScriptType } from '../components/script';
import { ScriptRuntime } from '../scriptRuntime';
import { Entity } from '../entity';
import { ComponetAction } from '../entityManager';

const scriptCacheClasss: IStringDictionary<any> = {}
export class ScriptSystem extends System {
    static queries: IStringDictionary<ISystemQuery> = {
        scripts: { components: [ScriptComponent] }
    };

    init = (arg0: any) => {
        this.world.on(`${ComponetAction.CHANGE}#${ScriptComponent.name}`, (component: ScriptComponent, name: string, oldValue: any, newValue: any) => {
            debugger
        })

    }

    execute(timer: ITimer) {
        const scripts = this.queries.scripts.entities;

        for (let i = 0; i < scripts.length; i++) {
            const entity: Entity = scripts[i];
            const scriptCom: ScriptComponent = entity.getMutableComponent(ScriptComponent);


            const scriptAsset = scriptCom.asset 
            if (!scriptAsset.Com)
                scriptAsset.eval();

            if (!entity.cache.geometry) {
                switch (scriptCom.scriptType) {
                    case ScriptType.Geometry:  
                        entity.cache.geometry = new scriptAsset.Com();

                        break;

                    default:
                        break;
                }
            }
        }
    }


}