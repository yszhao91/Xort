import { Texture } from './texture'; 
import { fragmentShader, vertexShader } from '../../shader/mesh.wgsl';
import { Undefinable } from '@xort/of';

const baseVertexCode: string = vertexShader
const fragmentVertexCode: string = fragmentShader;

export class MaterialData {
    uniforms: any;
    attributes: any;
    vertexShaderCode: string = baseVertexCode;
    fragmentShaderCode: string = fragmentVertexCode;
    computeShader?: string;

    transparent: boolean = false;
    opacity: number = 1;

    map: Undefinable<Texture>;
    vertexEntryPoint: string = 'main';
    fragmentEntryPoint: string = 'main';
    colorFormat: GPUTextureFormat = 'rgba8unorm';
    alphaBlend: GPUBlendComponent = {};
    // {
    //     operation: 'add',
    //     srcFactor: 'one',
    //     dstFactor: 'one-minus-src'
    // };
    colorBlend: GPUBlendComponent = {};
    colorWriteMask: GPUColorWriteFlags = 0;
    topology: GPUPrimitiveTopology = 'triangle-list';
    frontFace: GPUFrontFace = 'ccw';
    cullMode: GPUCullMode = 'back';

    constructor() {
        
    }
}