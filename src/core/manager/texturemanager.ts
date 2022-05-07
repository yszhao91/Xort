import { Texture } from "../data/texture";
import { Xort } from "../xort";
import { BaseManager } from "./baseManager";



export class TextureManager extends BaseManager {
    device: GPUDevice;
    constructor(xort: Xort) {
        super(xort);
        this.device = this.xort._vision.device;

    }

    private _loadTexture(texture: Texture): boolean {

        let needsUpdate = false;
        const textureCache = this.get(texture)
        let textureGPU = textureCache.textureGPU;

        const textureGPUDescriptor: any = {
            // size: {
            //     width: width,
            //     height: height,
            //     depthOrArrayLayers: depth,
            // },
            // mipLevelCount: mipLevelCount,
            // sampleCount: 1,
            // dimension: dimension,
            // format: format,
            // usage: usage
        };

        if (textureGPU === undefined) {

            textureGPU = this.device.createTexture(textureGPUDescriptor);
            textureCache.textureGPU = textureGPU;

            needsUpdate = true;
        }

        return needsUpdate;
    }

}