import { ISystemQuery, System } from '../system';
import { ITimer } from '../utils/timer';
import { ScriptComponent, ScriptType } from '../components/script';
import { Entity } from '../entity';
import * as Cesium from 'cesium';
import { IStringDictionary } from '../types';

export class MeshSystem extends System {

    order: number = 1000;
    static queries: IStringDictionary<ISystemQuery> = {
        scripts: { components: [ScriptComponent] }
    }; 

    execute(timer: ITimer) { 
        const scripts = this.queries.scripts.entities;
 
        for (let i = 0; i < scripts.length; i++) {
            const entity: Entity = scripts[i];
            const scriptCom: ScriptComponent = entity.getMutableComponent(ScriptComponent);
            if (scriptCom.scriptType !== ScriptType.Geometry)
                continue;

            if (!entity.cache.primitive && entity.cache.geometry) { }
            else
                continue

            const ps = Cesium.Cartesian3.fromDegrees(109, 28, 2000);

            // viewer.scene.primitives.add(extrudeEntity.object);
            const geo = entity.cache.geometry.build();

            //使用抽象的Primitive而不是RectanglePrimitive
            entity.cache.primitive = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({ geometry: geo }),
                compressVertices: false,
                modelMatrix: Cesium.Transforms.northUpEastToFixedFrame(ps),
                //使用该外观，可以使矩形覆盖在地球表面，或者悬浮一定的高度 
                appearance: new Cesium.MaterialAppearance({
                    material: new Cesium.Material({
                        fabric: {
                            type: 'Image',
                            uniforms: {
                                image: "./test/mj_dif.png",
                                color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
                            }
                        }
                    }),
                    faceForward: true
                }),
                asynchronous: false
            });

            
        }

    }


}