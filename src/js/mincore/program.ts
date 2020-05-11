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
    getParameters(material, lights, shadows, scene, nClipPlanes, nClipIntersection, object) {

        var fog = scene.fog;
        var environment = material.isMeshStandardMaterial ? scene.environment : null;

        var envMap = material.envMap || environment;

        var shaderID = shaderIDs[material.type];

        // heuristics to create shader parameters according to lights in the scene
        // (not to blow over maxLights budget)

        var maxBones = object.isSkinnedMesh ? allocateBones(object) : 0;

        if (material.precision !== null) {

            precision = capabilities.getMaxPrecision(material.precision);

            if (precision !== material.precision) {

                console.warn('THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.');

            }

        }

        var shaderobject = getShaderObject(material, shaderID);
        material.onBeforeCompile(shaderobject, renderer);

        var currentRenderTarget = renderer.getRenderTarget();

        var parameters = {

            isWebGL2: isWebGL2,

            shaderID: shaderID,
            shaderName: shaderobject.name,

            uniforms: shaderobject.uniforms,
            vertexShader: shaderobject.vertexShader,
            fragmentShader: shaderobject.fragmentShader,
            defines: material.defines,

            isRawShaderMaterial: material.isRawShaderMaterial,
            isShaderMaterial: material.isShaderMaterial,

            precision: precision,

            instancing: object.isInstancedMesh === true,

            supportsVertexTextures: vertexTextures,
            outputEncoding: (currentRenderTarget !== null) ? getTextureEncodingFromMap(currentRenderTarget.texture) : renderer.outputEncoding,
            map: !!material.map,
            mapEncoding: getTextureEncodingFromMap(material.map),
            matcap: !!material.matcap,
            matcapEncoding: getTextureEncodingFromMap(material.matcap),
            envMap: !!envMap,
            envMapMode: envMap && envMap.mapping,
            envMapEncoding: getTextureEncodingFromMap(envMap),
            envMapCubeUV: (!!envMap) && ((envMap.mapping === CubeUVReflectionMapping) || (envMap.mapping === CubeUVRefractionMapping)),
            lightMap: !!material.lightMap,
            lightMapEncoding: getTextureEncodingFromMap(material.lightMap),
            aoMap: !!material.aoMap,
            emissiveMap: !!material.emissiveMap,
            emissiveMapEncoding: getTextureEncodingFromMap(material.emissiveMap),
            bumpMap: !!material.bumpMap,
            normalMap: !!material.normalMap,
            objectSpaceNormalMap: material.normalMapType === ObjectSpaceNormalMap,
            tangentSpaceNormalMap: material.normalMapType === TangentSpaceNormalMap,
            clearcoatMap: !!material.clearcoatMap,
            clearcoatRoughnessMap: !!material.clearcoatRoughnessMap,
            clearcoatNormalMap: !!material.clearcoatNormalMap,
            displacementMap: !!material.displacementMap,
            roughnessMap: !!material.roughnessMap,
            metalnessMap: !!material.metalnessMap,
            specularMap: !!material.specularMap,
            alphaMap: !!material.alphaMap,

            gradientMap: !!material.gradientMap,

            sheen: !!material.sheen,

            combine: material.combine,

            vertexTangents: (material.normalMap && material.vertexTangents),
            vertexColors: material.vertexColors,
            vertexUvs: !!material.map || !!material.bumpMap || !!material.normalMap || !!material.specularMap || !!material.alphaMap || !!material.emissiveMap || !!material.roughnessMap || !!material.metalnessMap || !!material.clearcoatMap || !!material.clearcoatRoughnessMap || !!material.clearcoatNormalMap || !!material.displacementMap,
            uvsVertexOnly: !(!!material.map || !!material.bumpMap || !!material.normalMap || !!material.specularMap || !!material.alphaMap || !!material.emissiveMap || !!material.roughnessMap || !!material.metalnessMap || !!material.clearcoatNormalMap) && !!material.displacementMap,

            fog: !!fog,
            useFog: material.fog,
            fogExp2: (fog && fog.isFogExp2),

            flatShading: material.flatShading,

            sizeAttenuation: material.sizeAttenuation,
            logarithmicDepthBuffer: logarithmicDepthBuffer,

            skinning: material.skinning && maxBones > 0,
            maxBones: maxBones,
            useVertexTexture: floatVertexTextures,

            morphTargets: material.morphTargets,
            morphNormals: material.morphNormals,
            maxMorphTargets: renderer.maxMorphTargets,
            maxMorphNormals: renderer.maxMorphNormals,

            numDirLights: lights.directional.length,
            numPointLights: lights.point.length,
            numSpotLights: lights.spot.length,
            numRectAreaLights: lights.rectArea.length,
            numHemiLights: lights.hemi.length,

            numDirLightShadows: lights.directionalShadowMap.length,
            numPointLightShadows: lights.pointShadowMap.length,
            numSpotLightShadows: lights.spotShadowMap.length,

            numClippingPlanes: nClipPlanes,
            numClipIntersection: nClipIntersection,

            dithering: material.dithering,

            shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
            shadowMapType: renderer.shadowMap.type,

            toneMapping: material.toneMapped ? renderer.toneMapping : NoToneMapping,
            physicallyCorrectLights: renderer.physicallyCorrectLights,

            premultipliedAlpha: material.premultipliedAlpha,

            alphaTest: material.alphaTest,
            doubleSided: material.side === DoubleSide,
            flipSided: material.side === BackSide,

            depthPacking: (material.depthPacking !== undefined) ? material.depthPacking : false,

            index0AttributeName: material.index0AttributeName,

            extensionDerivatives: material.extensions && material.extensions.derivatives,
            extensionFragDepth: material.extensions && material.extensions.fragDepth,
            extensionDrawBuffers: material.extensions && material.extensions.drawBuffers,
            extensionShaderTextureLOD: material.extensions && material.extensions.shaderTextureLOD,

            rendererExtensionFragDepth: isWebGL2 || extensions.get('EXT_frag_depth') !== null,
            rendererExtensionDrawBuffers: isWebGL2 || extensions.get('WEBGL_draw_buffers') !== null,
            rendererExtensionShaderTextureLod: isWebGL2 || extensions.get('EXT_shader_texture_lod') !== null,

            onBeforeCompile: material.onBeforeCompile

        };

        return parameters;

    };


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