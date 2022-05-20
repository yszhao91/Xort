import { Texture } from "../data/texture";
import { Xort } from "../xort";
import { BaseManager } from "./baseManager";



export class TextureManager extends BaseManager {
    device: GPUDevice;
    constructor(xort: Xort) {
        super(xort);
        this.device = this.xort._vision.device;

    }



    loadTexture(texture: Texture): boolean {

        let needsUpdate = false;
        const textureCache = this.get(texture)
        let textureGPU = textureCache.textureGPU;

        const textureGPUDescriptor: GPUTextureDescriptor = {
            size: {
                width: texture.width,
                height: texture.height,
                depthOrArrayLayers: texture.depth,
            },
            mipLevelCount: texture.mipLevelCount,
            sampleCount: 1,
            dimension: texture.dimension,
            format: texture.format,
            usage: GPUTextureUsage.TEXTURE_BINDING
                | GPUTextureUsage.COPY_DST
            // | GPUTextureUsage.RENDER_ATTACHMENT,
        };


        if (textureGPU === undefined) { 
            textureGPU = this.device.createTexture(textureGPUDescriptor);
            textureCache.textureGPU = textureGPU; 
            needsUpdate = true;
        }

        return needsUpdate;
    }

    createDeeptexture() {
        // 深度纹理
        const depthTexture = device.createTexture({
            size: [800, 600],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })

        return depthTexture;
    }
}