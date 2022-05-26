import { EventHandler } from '../../cga/render/eventhandler';
import { UUID } from '../../of/core/uuid';
import { Undefinable } from '../../cga/utils/types';
export class Texture extends EventHandler {
    id: any = UUID.Instanced.getID('texture_', true);
    url: string = '';
    image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

    width: number = 1;
    height: number = 1;
    depth: number = 1;
    mipLevelCount: Undefinable<number>;
    dimension: GPUTextureDimension = '2d';
    format: GPUTextureFormat = 'rgba8uint';
    mipmap: boolean = true;
    minFilter: GPUFilterMode = 'linear';
    magFilter: GPUFilterMode = 'linear'
    wrapU: GPUAddressMode = 'repeat';
    wrapV: GPUAddressMode = 'repeat';


    constructor() {
        super();
    }


    loadImage(url: string) {
        this.url = url;
        this.image = new Image();
        this.image.src = url;  
    }

    loadVideo(url: string) {
        
    }
}