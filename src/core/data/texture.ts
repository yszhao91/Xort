import { EventHandler } from '../../cga/render/eventhandler';
import { UUID } from '../../of/core/uuid';
export class Texture extends EventHandler {
    id: any = UUID.Instanced.getID('texture_', true);
    image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    constructor() {
        super();
    }
}