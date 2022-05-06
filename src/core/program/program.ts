import { UUID } from 'object_frame';
import { ProgramCmd } from '../GLuse';
import { GLUniforms } from "./uniforms/uniform";
import { IStringDictionary } from '../../../of/utils/types';
import { ShaderUnits } from '../shaderunit';

const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/; // Beginning of main
const REGEX_END_OF_MAIN = /}\n?[^{}]*$/; // End of main, assumes main is last function

/**
 * 生成shader精度语句
 * @param parameters 
 * @returns 
 */
function generatePrecision(parameters: ProgramParamters) {

    let precisionstring = 'precision ' + parameters.precision + ' float;\nprecision ' + parameters.precision + ' int;';

    if (parameters.precision === 'highp') {

        precisionstring += '\n#define HIGH_PRECISION';

    } else if (parameters.precision === 'mediump') {

        precisionstring += '\n#define MEDIUM_PRECISION';

    } else if (parameters.precision === 'lowp') {

        precisionstring += '\n#define LOW_PRECISION';

    }

    return precisionstring;

}


function generateShadowMapTypeDefine(parameters: ProgramParamters) {

    let shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

    if (parameters.shadowMapType === ShadowMapType.PCF) {

        shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

    } else if (parameters.shadowMapType === ShadowMapType.PCF_SOFT) {

        shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

    } else if (parameters.shadowMapType === ShadowMapType.VSM) {

        shadowMapTypeDefine = 'SHADOWMAP_TYPE_VSM';

    }

    return shadowMapTypeDefine;

}

export enum ShadowMapType {
    BASIC,
    PCF,
    PCF_SOFT,
    VSM
}
export enum ReflectionMapping {
    CUBE,
    CUBE_UV,
}
export enum RefractionMapping {
    CUBE = 3,
    CUBE_UV,
}

function generateEnvMapTypeDefine(parameters: ProgramParamters) {

    let envMapTypeDefine = 'ENVMAP_TYPE_CUBE';

    if (parameters.envMap) {

        switch (parameters.envMapMode) {

            case ReflectionMapping.CUBE:
            case RefractionMapping.CUBE:
                envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
                break;

            case ReflectionMapping.CUBE_UV:
            case RefractionMapping.CUBE_UV:
                envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
                break;

        }

    }

    return envMapTypeDefine;

}

function generateEnvMapModeDefine(parameters: ProgramParamters) {

    let envMapModeDefine = 'ENVMAP_MODE_REFLECTION';

    if (parameters.envMap) {

        switch (parameters.envMapMode) {

            case RefractionMapping.CUBE:
            case RefractionMapping.CUBE_UV:

                envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
                break;

        }

    }

    return envMapModeDefine;

}

function generateEnvMapBlendingDefine(parameters: ProgramParamters) {

    let envMapBlendingDefine = 'ENVMAP_BLENDING_NONE';

    if (parameters.envMap) {

        switch (parameters.combine) {

            case 'MultiplyOperation':
                envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
                break;

            case 'MixOperation':
                envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
                break;

            case 'AddOperation':
                envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
                break;

        }

    }

    return envMapBlendingDefine;

}

function filterEmptyLine(string: string) {

    return string !== '';

}

function generateExtensions(parameters: ProgramParamters) {

    const chunks = [
        (parameters.extensionDerivatives || parameters.envMapCubeUV || parameters.bumpMap || parameters.tangentSpaceNormalMap || parameters.clearcoatNormalMap || parameters.flatShading || parameters.shaderID === 'physical') ? '#extension GL_OES_standard_derivatives : enable' : '',
        (parameters.extensionFragDepth || parameters.logarithmicDepthBuffer) && parameters.rendererExtensionFragDepth ? '#extension GL_EXT_frag_depth : enable' : '',
        (parameters.extensionDrawBuffers && parameters.rendererExtensionDrawBuffers) ? '#extension GL_EXT_draw_buffers : require' : '',
        (parameters.extensionShaderTextureLOD || parameters.envMap || parameters.transmission > 0.0) && parameters.rendererExtensionShaderTextureLod ? '#extension GL_EXT_shader_texture_lod : enable' : ''
    ];

    return chunks.filter(filterEmptyLine).join('\n');

}


function generateDefines(defines: IStringDictionary<any>) {

    const chunks = [];

    for (const name in defines) {

        const value = defines[name];

        if (value === false) continue;

        chunks.push('#define ' + name + ' ' + value);

    }

    return chunks.join('\n');

}

/**
 * 灯光数量
 * @param shaderCode 
 * @param parameters 
 * @returns 
 */
function replaceLightNums(shaderCode: string, parameters: any) {

    return shaderCode
        .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
        .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
        .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
        .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
        .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights)
        .replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows)
        .replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows)
        .replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);

}

/**
 * Clip Plane
 * @param string 
 * @param parameters 
 * @returns 
 */
function replaceClippingPlaneNums(shaderCode: string, parameters: ProgramParamters) {
    return shaderCode
        .replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes)
    // .replace(/UNION_CLIPPING_PLANES/g, (parameters.numClippingPlanes - parameters.numClipIntersection));

}

// Resolve Includes

const includePattern = /^[ \t]*#include\s*<([\w\d./]+)>/gm;

function resolveIncludes(shaderCode: string): string {

    return shaderCode.replace(includePattern, includeReplacer);

}


function includeReplacer(match: any, include: string) {

    const shaderUnit: any = (ShaderUnits as any)[include];

    if (shaderUnit === undefined) {

        throw new Error('Can not resolve #include <' + include + '>');

    }

    return resolveIncludes(shaderUnit);

}
function getEncodingComponents(encoding: any) {

    switch (encoding) {

        case 'LinearEncoding':
            return ['Linear', '( value )'];
        case 'sRGBEncoding':
            return ['sRGB', '( value )'];
        case 'RGBEEncoding':
            return ['RGBE', '( value )'];
        case 'RGBM7Encoding':
            return ['RGBM', '( value, 7.0 )'];
        case 'RGBM16Encoding':
            return ['RGBM', '( value, 16.0 )'];
        case 'RGBDEncoding':
            return ['RGBD', '( value, 256.0 )'];
        case 'GammaEncoding':
            return ['Gamma', '( value, float( GAMMA_FACTOR ) )'];
        case 'LogLuvEncoding':
            return ['LogLuv', '( value )'];
        default:
            console.warn('THREE.WebGLProgram: Unsupported encoding:', encoding);
            return ['Linear', '( value )'];

    }

}

function getTexelDecodingFunction(functionName: string, encoding: any) {

    const components = getEncodingComponents(encoding);
    return 'vec4 ' + functionName + '( vec4 value ) { return ' + components[0] + 'ToLinear' + components[1] + '; }';

}

export function fetchAttributeLocations(gl: WebGL2RenderingContext, program: WebGLProgram) {

    const attributes: IStringDictionary<any> = {};

    const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < n; i++) {

        const info: WebGLActiveInfo = gl.getActiveAttrib(program, i)!;
        const name = info.name;

        let locationSize = 1;
        if (info.type === gl.FLOAT_MAT2) locationSize = 2;
        if (info.type === gl.FLOAT_MAT3) locationSize = 3;
        if (info.type === gl.FLOAT_MAT4) locationSize = 4;


        console.log('Xort: ACTIVE VERTEX ATTRIBUTE:', name, i);

        attributes[name] = {
            type: info.type,
            location: gl.getAttribLocation(program, name),
            locationSize: locationSize
        };

    }

    return attributes;

}

export interface ProgramParamters {
    numClipIntersection: string;
    numClippingPlanes: string;
    shaderID: string;
    rendererExtensionDrawBuffers: any;
    envMapCubeUV: any;
    extensionDrawBuffers: any;
    extensionFragDepth: any;
    extensionDerivatives: any;
    combine: any;
    envMapMode: any;
    precision: string;
    shadowMapType: ShadowMapType;
    normalMap: boolean;
    objectSpaceNormalMap: boolean;
    tangentSpaceNormalMap: boolean;
    clearcoatMap: boolean;
    clearcoatRoughnessMap: boolean;
    clearcoatNormalMap: boolean;
    displacementMap: boolean;
    specularMap: boolean;
    roughnessMap: boolean;
    metalnessMap: boolean;
    alphaMap: boolean;
    transmission: any;
    transmissionMap: boolean;
    thicknessMap: boolean;
    vertexTangents: any;
    vertexColors: any;
    vertexAlphas: any;
    vertexUvs: any;
    uvsVertexOnly: any;
    flatShading: any;
    skinning: any;
    useVertexTexture: any;
    morphTargets: any;
    morphNormals: boolean;
    doubleSided: any;
    flipSided: any;
    shadowMapEnabled: any;
    sizeAttenuation: any;
    logarithmicDepthBuffer: any;
    rendererExtensionFragDepth: any;
    alphaTest: any;
    matcap: any;
    sheen: any;
    gradientMap: boolean;
    premultipliedAlpha: any;
    physicallyCorrectLights: any;
    extensionShaderTextureLOD: any;
    rendererExtensionShaderTextureLod: any;
    dithering: boolean;
    depthPacking: any;
    index0AttributeName: any;
    bumpMap: boolean;
    emissiveMap: boolean;
    aoMap: boolean;
    lightMap: boolean;
    envMap: boolean;
    map: boolean;
    fogExp2: any;
    fog: any;
    maxBones: string;
    useFog: boolean;
    supportsVertexTextures: boolean;
    instancingColor: boolean;
    instancing: boolean;
    vertexShader: string;
    fragmentShader: string;
    defines?: any;
    isWebGL2?: boolean;
    glslVersion?: string,
    isRawShaderMaterial?: boolean;
    shaderName?: string;
    doubleVertex?: boolean;//double双精度顶点

    numDirLights: number;
    numPointLights: number,
    numSpotLights: number,
    numRectAreaLights: number,
    numHemiLights: number,

    numDirLightShadows: number,
    numPointLightShadows: number,
    numSpotLightShadows: number,

    toneMapping: any,

    customProgramCacheKey: string;

}

export class GLProgram {
    diagnostics: any;
    program!: WebGLProgram | null;
    gl: WebGL2RenderingContext;
    usedTimes: number = 1;
    cacheKey: string = UUID.unique;
    parameters: ProgramParamters;
    finalVertexGlsl: string;
    finalfragmentGlsl: string;
    id: any = UUID.Instanced.getID('program', true);
    constructor(gl: WebGL2RenderingContext, parameters: ProgramParamters) {
        this.gl = gl;
        this.parameters = parameters

        const defines = parameters.defines;

        let vertexShader = parameters.vertexShader;
        let fragmentShader = parameters.fragmentShader;

        const shadowMapTypeDefine = generateShadowMapTypeDefine(parameters);
        const envMapTypeDefine = generateEnvMapTypeDefine(parameters);
        const envMapModeDefine = generateEnvMapModeDefine(parameters);
        const envMapBlendingDefine = generateEnvMapBlendingDefine(parameters);

        const customExtensions = parameters.isWebGL2 ? '' : generateExtensions(parameters);

        const customDefines = generateDefines(defines);

        let prefixVertex, prefixFragment;
        let versionString = parameters.glslVersion ? '#version ' + parameters.glslVersion + '\n' : '';

        if (parameters.isRawShaderMaterial) {

            prefixVertex = [

                customDefines

            ].filter(filterEmptyLine).join('\n');

            if (prefixVertex.length > 0) {

                prefixVertex += '\n';

            }

            prefixFragment = [

                customExtensions,
                customDefines

            ].filter(filterEmptyLine).join('\n');

            if (prefixFragment.length > 0) {

                prefixFragment += '\n';

            }

        } else {

            prefixVertex = [

                generatePrecision(parameters),

                '#define SHADER_NAME ' + parameters.shaderName,

                customDefines,

                parameters.doubleVertex ? '#define USE_DOUBLEVETEX' : '',

                parameters.instancing ? '#define USE_INSTANCING' : '',
                parameters.instancingColor ? '#define USE_INSTANCING_COLOR' : '',

                parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

                // '#define GAMMA_FACTOR ' + gammaFactorDefine,

                '#define MAX_BONES ' + parameters.maxBones,
                (parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
                (parameters.useFog && parameters.fogExp2) ? '#define FOG_EXP2' : '',

                parameters.map ? '#define USE_MAP' : '',
                parameters.envMap ? '#define USE_ENVMAP' : '',
                parameters.envMap ? '#define ' + envMapModeDefine : '',
                parameters.lightMap ? '#define USE_LIGHTMAP' : '',
                parameters.aoMap ? '#define USE_AOMAP' : '',
                parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
                parameters.bumpMap ? '#define USE_BUMPMAP' : '',
                parameters.normalMap ? '#define USE_NORMALMAP' : '',
                (parameters.normalMap && parameters.objectSpaceNormalMap) ? '#define OBJECTSPACE_NORMALMAP' : '',
                (parameters.normalMap && parameters.tangentSpaceNormalMap) ? '#define TANGENTSPACE_NORMALMAP' : '',

                parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
                parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
                parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
                parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
                parameters.specularMap ? '#define USE_SPECULARMAP' : '',
                parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
                parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
                parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
                parameters.transmission ? '#define USE_TRANSMISSION' : '',
                parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
                parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

                parameters.vertexTangents ? '#define USE_TANGENT' : '',
                parameters.vertexColors ? '#define USE_COLOR' : '',
                parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
                parameters.vertexUvs ? '#define USE_UV' : '',
                parameters.uvsVertexOnly ? '#define UVS_VERTEX_ONLY' : '',

                parameters.flatShading ? '#define FLAT_SHADED' : '',

                parameters.skinning ? '#define USE_SKINNING' : '',
                parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',

                parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
                parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
                parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
                parameters.flipSided ? '#define FLIP_SIDED' : '',

                parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
                parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

                parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

                parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
                (parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth) ? '#define USE_LOGDEPTHBUF_EXT' : '',

                'uniform mat4 modelMatrix;',
                'uniform mat4 modelViewMatrix;',
                'uniform mat4 projectionMatrix;',
                'uniform mat4 viewMatrix;',
                'uniform mat3 normalMatrix;',
                'uniform vec3 cameraPosition;',
                'uniform bool isOrthographic;',

                '#ifdef USE_INSTANCING',

                '	attribute mat4 instanceMatrix;',

                '#endif',

                '#ifdef USE_INSTANCING_COLOR',

                '	attribute vec3 instanceColor;',

                '#endif',

                'attribute vec3 position;',
                'attribute vec3 normal;',
                'attribute vec2 uv;',

                '#ifdef USE_TANGENT',

                '	attribute vec4 tangent;',

                '#endif',

                '#if defined( USE_COLOR_ALPHA )',

                '	attribute vec4 color;',

                '#elif defined( USE_COLOR )',

                '	attribute vec3 color;',

                '#endif',

                '#ifdef USE_MORPHTARGETS',

                '	attribute vec3 morphTarget0;',
                '	attribute vec3 morphTarget1;',
                '	attribute vec3 morphTarget2;',
                '	attribute vec3 morphTarget3;',

                '	#ifdef USE_MORPHNORMALS',

                '		attribute vec3 morphNormal0;',
                '		attribute vec3 morphNormal1;',
                '		attribute vec3 morphNormal2;',
                '		attribute vec3 morphNormal3;',

                '	#else',

                '		attribute vec3 morphTarget4;',
                '		attribute vec3 morphTarget5;',
                '		attribute vec3 morphTarget6;',
                '		attribute vec3 morphTarget7;',

                '	#endif',

                '#endif',

                '#ifdef USE_SKINNING',

                '	attribute vec4 skinIndex;',
                '	attribute vec4 skinWeight;',

                '#endif',

                '\n'

            ].filter(filterEmptyLine).join('\n');

            prefixFragment = [

                customExtensions,

                generatePrecision(parameters),

                '#define SHADER_NAME ' + parameters.shaderName,

                customDefines,

                parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest + (parameters.alphaTest % 1 ? '' : '.0') : '', // add '.0' if integer

                // '#define GAMMA_FACTOR ' + gammaFactorDefine,

                (parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
                (parameters.useFog && parameters.fogExp2) ? '#define FOG_EXP2' : '',

                parameters.map ? '#define USE_MAP' : '',
                parameters.matcap ? '#define USE_MATCAP' : '',
                parameters.envMap ? '#define USE_ENVMAP' : '',
                parameters.envMap ? '#define ' + envMapTypeDefine : '',
                parameters.envMap ? '#define ' + envMapModeDefine : '',
                parameters.envMap ? '#define ' + envMapBlendingDefine : '',
                parameters.lightMap ? '#define USE_LIGHTMAP' : '',
                parameters.aoMap ? '#define USE_AOMAP' : '',
                parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
                parameters.bumpMap ? '#define USE_BUMPMAP' : '',
                parameters.normalMap ? '#define USE_NORMALMAP' : '',
                (parameters.normalMap && parameters.objectSpaceNormalMap) ? '#define OBJECTSPACE_NORMALMAP' : '',
                (parameters.normalMap && parameters.tangentSpaceNormalMap) ? '#define TANGENTSPACE_NORMALMAP' : '',
                parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
                parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
                parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
                parameters.specularMap ? '#define USE_SPECULARMAP' : '',
                parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
                parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
                parameters.alphaMap ? '#define USE_ALPHAMAP' : '',

                parameters.sheen ? '#define USE_SHEEN' : '',
                parameters.transmission ? '#define USE_TRANSMISSION' : '',
                parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
                parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

                parameters.vertexTangents ? '#define USE_TANGENT' : '',
                parameters.vertexColors || parameters.instancingColor ? '#define USE_COLOR' : '',
                parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
                parameters.vertexUvs ? '#define USE_UV' : '',
                parameters.uvsVertexOnly ? '#define UVS_VERTEX_ONLY' : '',

                parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

                parameters.flatShading ? '#define FLAT_SHADED' : '',

                parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
                parameters.flipSided ? '#define FLIP_SIDED' : '',

                parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
                parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

                parameters.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',

                parameters.physicallyCorrectLights ? '#define PHYSICALLY_CORRECT_LIGHTS' : '',

                parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
                (parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth) ? '#define USE_LOGDEPTHBUF_EXT' : '',

                ((parameters.extensionShaderTextureLOD || parameters.envMap) && parameters.rendererExtensionShaderTextureLod) ? '#define TEXTURE_LOD_EXT' : '',

                'uniform mat4 viewMatrix;',
                'uniform vec3 cameraPosition;',
                'uniform bool isOrthographic;',

                // (parameters.toneMapping !== NoToneMapping) ? '#define TONE_MAPPING' : '',
                // (parameters.toneMapping !== NoToneMapping) ? ShaderUnit['tonemapping_pars_fragment'] : '', // this code is required here because it is used by the toneMapping() function defined below
                // (parameters.toneMapping !== NoToneMapping) ? getToneMappingFunction('toneMapping', parameters.toneMapping) : '',

                parameters.dithering ? '#define DITHERING' : '',

                // ShaderUnit['encodings_pars_fragment'], // this code is required here because it is used by the various encoding/decoding function defined below
                // parameters.map ? getTexelDecodingFunction('mapTexelToLinear', parameters.mapEncoding) : '',
                // parameters.matcap ? getTexelDecodingFunction('matcapTexelToLinear', parameters.matcapEncoding) : '',
                // parameters.envMap ? getTexelDecodingFunction('envMapTexelToLinear', parameters.envMapEncoding) : '',
                // parameters.emissiveMap ? getTexelDecodingFunction('emissiveMapTexelToLinear', parameters.emissiveMapEncoding) : '',
                // parameters.lightMap ? getTexelDecodingFunction('lightMapTexelToLinear', parameters.lightMapEncoding) : '',
                // getTexelEncodingFunction('linearToOutputTexel', parameters.outputEncoding),

                parameters.depthPacking ? '#define DEPTH_PACKING ' + parameters.depthPacking : '',

                '\n'

            ].filter(filterEmptyLine).join('\n');

        }

        vertexShader = resolveIncludes(vertexShader);
        vertexShader = replaceLightNums(vertexShader, parameters);
        vertexShader = replaceClippingPlaneNums(vertexShader, parameters);

        fragmentShader = resolveIncludes(fragmentShader);
        fragmentShader = replaceLightNums(fragmentShader, parameters);
        fragmentShader = replaceClippingPlaneNums(fragmentShader, parameters);

        if (parameters.isWebGL2 && parameters.isRawShaderMaterial !== true) {

            // GLSL 3.0 conversion for built-in materials and ShaderMaterial

            versionString = '#version 300 es\n';

            prefixVertex = [
                '#define attribute in',
                '#define varying out',
                '#define texture2D texture'
            ].join('\n') + '\n' + prefixVertex;

            prefixFragment = [
                '#define varying in',
                (parameters.glslVersion === 'GLSL3') ? '' : 'out highp vec4 pc_fragColor;',
                (parameters.glslVersion === 'GLSL3') ? '' : '#define gl_FragColor pc_fragColor',
                '#define gl_FragDepthEXT gl_FragDepth',
                '#define texture2D texture',
                '#define textureCube texture',
                '#define texture2DProj textureProj',
                '#define texture2DLodEXT textureLod',
                '#define texture2DProjLodEXT textureProjLod',
                '#define textureCubeLodEXT textureLod',
                '#define texture2DGradEXT textureGrad',
                '#define texture2DProjGradEXT textureProjGrad',
                '#define textureCubeGradEXT textureGrad'
            ].join('\n') + '\n' + prefixFragment;

        }

        const vertexGlsl = versionString + prefixVertex + vertexShader;
        const fragmentGlsl = versionString + prefixFragment + fragmentShader;

        this.finalVertexGlsl = vertexGlsl;
        this.finalfragmentGlsl = fragmentGlsl;
        console.log(this)
        const program: WebGLProgram = ProgramCmd.createrProgram(gl, vertexGlsl, fragmentGlsl)!

        // Force a particular attribute to index 0.

        if (parameters.index0AttributeName !== undefined) {

            gl.bindAttribLocation(program, 0, parameters.index0AttributeName);

        } else if (parameters.morphTargets === true) {

            // programs with morphTargets displace position out of attribute 0
            gl.bindAttribLocation(program, 0, 'position');

        }

        this.program = program;
    }

    /**
     * 获取shader中所有unifrom
     * @returns 
     */
    getUniforms() {

        let cachedUniforms;
        if (cachedUniforms === undefined && this.program) {
            cachedUniforms = new GLUniforms(this.gl, this.program);
        }

        return cachedUniforms;

    };

    // set up caching for attribute locations 
    getAttributes() {
        let cachedAttributes;

        if (cachedAttributes === undefined && this.program) {
            cachedAttributes = fetchAttributeLocations(this.gl, this.program);
        }

        return cachedAttributes;

    };

    // free resource

    destroy() {

        // bindingStates.releaseStatesOfProgram(this);

        this.gl.deleteProgram(this.program);
        this.program = null;

    };



}
