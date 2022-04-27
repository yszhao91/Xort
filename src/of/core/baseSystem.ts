import { ITimer } from "..";

export class BaseSystem {
    components: Array<any> = new Array(); 

    public Register(component: any) {
        this.components.push(component);
    }

    public Update(gameTime: ITimer) {
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            (component as any).update(gameTime);
        }
    }

} 