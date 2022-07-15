import { Component, ComponentSchema } from "./nof/component";
import { World } from "./nof/world";
import { Types } from './of/utils/types';
import { System } from './nof/system';
import { ITimer } from "./of";
class TransfromCom extends Component<any> {
    static schema: ComponentSchema = {
        position: { type: Types.Vec3 },
        scale: { type: Types.Vec3 },
        euler: { type: Types.Euler }
    };
    constructor() {
        super();
    }
}
enum ACS {
    Ex = 'asd',
    Cx = 'wes',
    Mx = 'asd'
}

for (const key in ACS) {
    console.log(key);
    console.log((ACS as any)[key]);
}

class MoveSystem extends System {

    execute(timer: ITimer): void { 
        let entities = this.queriesEntity.results;
    }
}

const world = new World({ entityPoolSize: 10000 });
world.registerComponent(TransfromCom);
debugger
world.registerSystem(MoveSystem)



