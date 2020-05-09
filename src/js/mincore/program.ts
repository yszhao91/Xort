import { VERTEX_SHADER, FRAGMENT_SHADER, createProgram } from '../GL';

export enum ShaderType {
    VERTEX = VERTEX_SHADER,
    FRAGMENT = FRAGMENT_SHADER
}

export class Program {
    constructor() {

    }
    addLineNumbers(src, lineOffset?) {
        lineOffset = lineOffset || 0;
        ++lineOffset;

        return src.split("\n").map(function (line, ndx) {
            return (ndx + lineOffset) + ": " + line;
        }).join("\n");
    }



    createShader(gl: WebGL2RenderingContext, shaderType: ShaderType, glsl: string) {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, glsl);
        gl.compileShader(shader);

        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            const lastError = gl.getShaderInfoLog(shader);
            console.log(this.addLineNumbers(glsl) + "\n*** Error compiling shader: " + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createVertexShader(gl: WebGL2RenderingContext, glsl: string) {
        return this.createShader(gl, ShaderType.VERTEX, glsl);
    }

    createFragmentShader(gl: WebGL2RenderingContext, glsl: string) {
        return this.createShader(gl, ShaderType.FRAGMENT, glsl);
    }

    createProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
        const program = gl.createProgram();
        const vertexShader = this.createVertexShader(gl, vs);
        const fragmentShader = this.createVertexShader(gl, fs);
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        // Check the link status
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            const lastError = gl.getProgramInfoLog(program);
            console.log("Error in program linking:" + lastError);


            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);

            gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    a(parameters) {

        const prefixVertex = [

            generatePrecision(parameters),

            '#define SHADER_NAME ' + parameters.shaderName,

            customDefines,

            parameters.instancing ? '#define USE_INSTANCING' : '',
            parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

            '#define GAMMA_FACTOR ' + gammaFactorDefine,

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

            parameters.vertexTangents ? '#define USE_TANGENT' : '',
            parameters.vertexColors ? '#define USE_COLOR' : '',
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

            ' attribute mat4 instanceMatrix;',

            '#endif',

            'attribute vec3 position;',
            'attribute vec3 normal;',
            'attribute vec2 uv;',

            '#ifdef USE_TANGENT',

            '	attribute vec4 tangent;',

            '#endif',

            '#ifdef USE_COLOR',

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

            '#define GAMMA_FACTOR ' + gammaFactorDefine,

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

            parameters.vertexTangents ? '#define USE_TANGENT' : '',
            parameters.vertexColors ? '#define USE_COLOR' : '',
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

            (parameters.toneMapping !== NoToneMapping) ? '#define TONE_MAPPING' : '',
            (parameters.toneMapping !== NoToneMapping) ? ShaderChunk['tonemapping_pars_fragment'] : '', // this code is required here because it is used by the toneMapping() function defined below
            (parameters.toneMapping !== NoToneMapping) ? getToneMappingFunction('toneMapping', parameters.toneMapping) : '',

            parameters.dithering ? '#define DITHERING' : '',

            (parameters.outputEncoding || parameters.mapEncoding || parameters.matcapEncoding || parameters.envMapEncoding || parameters.emissiveMapEncoding || parameters.lightMapEncoding) ?
                ShaderChunk['encodings_pars_fragment'] : '', // this code is required here because it is used by the various encoding/decoding function defined below
            parameters.mapEncoding ? getTexelDecodingFunction('mapTexelToLinear', parameters.mapEncoding) : '',
            parameters.matcapEncoding ? getTexelDecodingFunction('matcapTexelToLinear', parameters.matcapEncoding) : '',
            parameters.envMapEncoding ? getTexelDecodingFunction('envMapTexelToLinear', parameters.envMapEncoding) : '',
            parameters.emissiveMapEncoding ? getTexelDecodingFunction('emissiveMapTexelToLinear', parameters.emissiveMapEncoding) : '',
            parameters.lightMapEncoding ? getTexelDecodingFunction('lightMapTexelToLinear', parameters.lightMapEncoding) : '',
            parameters.outputEncoding ? getTexelEncodingFunction('linearToOutputTexel', parameters.outputEncoding) : '',

            parameters.depthPacking ? '#define DEPTH_PACKING ' + parameters.depthPacking : '',

            '\n'

        ].filter(filterEmptyLine).join('\n');
    }
}