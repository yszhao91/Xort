import { Texture } from './texture';
import { Undefinable } from '../../of/utils/types';
const baseVertexCode: string = `main(){}`
const fragmentVertexCode: string = `
fn main() vec4<f32>{
    return vec4<f32(1.0,0.0,0.0,1.0);
}`
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

    constructor() {

    }
}