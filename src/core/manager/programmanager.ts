/** 
 * @Description  : Program 管理
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-22 08:35:44
 * @LastEditTime : 2021-09-23 16:40:17
 * @FilePath     : \dc_editor\src\frame\system\program\programs.ts
 *
 */

import { MetaVision } from "../renderer";


// const parameterNames = [
//     'precision', 'isWebGL2', 'supportsVertexTextures', 'outputEncoding', 'instancing', 'instancingColor',
//     'map', 'mapEncoding', 'matcap', 'matcapEncoding', 'envMap', 'envMapMode', 'envMapEncoding', 'envMapCubeUV',
//     'lightMap', 'lightMapEncoding', 'aoMap', 'emissiveMap', 'emissiveMapEncoding', 'bumpMap', 'normalMap', 'objectSpaceNormalMap', 'tangentSpaceNormalMap', 'clearcoatMap', 'clearcoatRoughnessMap', 'clearcoatNormalMap', 'displacementMap', 'specularMap',
//     'roughnessMap', 'metalnessMap', 'gradientMap',
//     'alphaMap', 'combine', 'vertexColors', 'vertexAlphas', 'vertexTangents', 'vertexUvs', 'uvsVertexOnly', 'fog', 'useFog', 'fogExp2',
//     'flatShading', 'sizeAttenuation', 'logarithmicDepthBuffer', 'skinning',
//     'maxBones', 'useVertexTexture', 'morphTargets', 'morphNormals', 'premultipliedAlpha',
//     'numDirLights', 'numPointLights', 'numSpotLights', 'numHemiLights', 'numRectAreaLights',
//     'numDirLightShadows', 'numPointLightShadows', 'numSpotLightShadows',
//     'shadowMapEnabled', 'shadowMapType', 'toneMapping', 'physicallyCorrectLights',
//     'alphaTest', 'doubleSided', 'flipSided', 'numClippingPlanes', 'numClipIntersection', 'depthPacking', 'dithering',
//     'sheen', 'transmission', 'transmissionMap', 'thicknessMap'
// ];
export class ProgramManager {
    programs: WebGLProgram[] = [];

    isWebGL2: boolean = true;
    floatVertexTextures!: number;
    maxVertexUniforms!: number;
    vertexTextures!: number;

    precision = 'highp';

    constructor(private renderer: MetaVision) {

    }

    getMaxBones(object: any) {

        const skeleton = object.skeleton;
        const bones = skeleton.bones;

        if (this.floatVertexTextures) {

            return 1024;

        } else {

            // default for when object is not specified
            // ( for example when prebuilding shader to be used with multiple objects )
            //
            //  - leave some extra space for other uniforms
            //  - limit here is ANGLE's 254 max uniform vectors
            //    (up to 54 should be safe)

            const nVertexUniforms = this.maxVertexUniforms;
            const nVertexMatrices = Math.floor((nVertexUniforms - 20) / 4);

            const maxBones = Math.min(nVertexMatrices, bones.length);

            if (maxBones < bones.length) {

                console.warn('THREE.WebGLRenderer: Skeleton has ' + bones.length + ' bones. This GPU supports ' + maxBones + '.');
                return 0;

            }

            return maxBones;

        }

    }

    getTextureEncodingFromMap(map: any) {

        let encoding;

        if (map && map.isTexture) {

            encoding = map.encoding;

        } else if (map && map.isWebGLRenderTarget) {

            console.warn('THREE.WebGLPrograms.getTextureEncodingFromMap: don\'t use render targets as textures. Use their .texture property instead.');
            encoding = map.texture.encoding;

        } else {

            // encoding = LinearEncoding;

        }

        return encoding;

    }

    getParameters(entity: ModelEntity, material: Material, scene: ModelScene | any, lights: LightManager) {
        const fog = scene.fog;
        const environment = material.type === MaterialType.Standard ? scene.environment : null;

        //cubeMap字典
        // const envMap = cubemaps.get(material.envMap || environment);
        const envMap = material.envMap || environment;

        // // heuristics to create shader parameters according to lights in the scene
        // // (not to blow over maxLights budget)

        // const maxBones = object.isSkinnedMesh ? this.getMaxBones(object) : 0; 
        if (material.precision !== null) {

        }

        let vertexShader, fragmentShader;
        if (material.type !== MaterialType.Raw) {

            const shader: any = ShaderLib[material.type];

            vertexShader = shader.vertexShader;
            fragmentShader = shader.fragmentShader;

        } else {

            vertexShader = material.vertexShader;
            fragmentShader = material.fragmentShader;

        }

        // const currentRenderTarget = renderer.getRenderTarget(); 
        const parameters: ProgramParamters | any = {
            isWebGL2: true,

            shaderID: material.type,
            shaderName: material.type,

            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            defines: material.defines,

            isRawShaderMaterial: material.type === MaterialType.Raw,
            glslVersion: material.glslVersion,

            precision: ShaderPrecision.highp,

            instancing: entity.dic.geometry && entity.dic.geometry._isInstanced === true,
            instancingColor: entity.dic.geometry && isDefined(entity.dic.geometry._instanceColor),

            supportsVertexTextures: true,
            // outputEncoding: 'string',
            map: !!material.map,
            // mapEncoding: GL.LINEAR,
            // matcap: !!material.matcap,
            // matcapEncoding: '',
            envMap: !!envMap,
            envMapMode: envMap && envMap.mapping,
            // envMapEncoding: '',
            envMapCubeUV: '',
            lightMap: !!material.lightMap,
            // lightMapEncoding: '',
            aoMap: !!material.aoMap,
            emissiveMap: !!material.emissiveMap,
            // emissiveMapEncoding: '',
            bumpMap: !!material.bumpMap,
            normalMap: !!material.normalMap,
            objectSpaceNormalMap: false,
            tangentSpaceNormalMap: false,
            clearcoatMap: !!material.clearcoatMap,
            clearcoatRoughnessMap: !!material.clearcoatRoughnessMap,
            clearcoatNormalMap: !!material.clearcoatNormalMap,
            displacementMap: !!material.displacementMap,
            roughnessMap: !!material.roughnessMap,
            metalnessMap: !!material.metalnessMap,
            // specularMap: !!material.specularMap,
            alphaMap: !!material.alphaMap,

            // gradientMap: !!material.gradientMap,

            // sheen: !!material.sheen,

            transmission: !!material.transmission,
            transmissionMap: !!material.transmissionMap,
            thicknessMap: !!material.thicknessMap,

            // combine: material.combine,

            // vertexTangents: (material.normalMap && material.vertexTangents),
            // vertexColors: material.vertexColors,
            // vertexAlphas: material.vertexColors === true && entity.dic.geometry && entity.dic.geometry.attributes.color && entity.dic.geometry.attributes.color.itemSize === 4,
            vertexUvs: !!material.map || !!material.bumpMap || !!material.normalMap || !!material.specularMap || !!material.alphaMap || !!material.emissiveMap || !!material.roughnessMap || !!material.metalnessMap || !!material.clearcoatMap || !!material.clearcoatRoughnessMap || !!material.clearcoatNormalMap || !!material.displacementMap || !!material.transmission || !!material.transmissionMap || !!material.thicknessMap,
            uvsVertexOnly: !(!!material.map || !!material.bumpMap || !!material.normalMap || !!material.specularMap || !!material.alphaMap || !!material.emissiveMap || !!material.roughnessMap || !!material.metalnessMap || !!material.clearcoatNormalMap || !!material.transmission || !!material.transmissionMap || !!material.thicknessMap) && !!material.displacementMap,

            fog: !!fog,
            useFog: material.fog,
            fogExp2: (fog && fog.isFogExp2),

            flatShading: !!material.flatShading,

            sizeAttenuation: material.sizeAttenuation,
            logarithmicDepthBuffer: this.capabilities.logarithmicDepthBuffer,

            // skinning: object.isSkinnedMesh === true && maxBones > 0,
            // maxBones: maxBones,
            useVertexTexture: this.floatVertexTextures,

            // morphTargets: material.morphTargets,
            // morphNormals: material.morphNormals,

            numDirLights: lights._length[LightType.Directional] || 0,
            numPointLights: lights._length[LightType.Point] || 0,
            numSpotLights: lights._length[LightType.Spot] || 0,// lights.spot.length,
            numRectAreaLights: lights._length[LightType.Rect] || 0,// lights.rectArea.length,
            numHemiLights: lights._length[LightType.Hemi] || 0,// lights.hemi.length,

            numDirLightShadows: 0,//lights.directionalShadowMap.length,
            numPointLightShadows: 0,// lights.pointShadowMap.length,
            numSpotLightShadows: 0,// lights.spotShadowMap.length,


            dithering: material.dithering,

            shadowMapEnabled: false,
            shadowMapType: ShadowMapType.BASIC,

            // toneMapping: material.toneMapped,
            physicallyCorrectLights: this.renderer.physicallyCorrectLights,

            // premultipliedAlpha: material.premultipliedAlpha,

            // alphaTest: material.alphaTest,
            doubleSided: material.side === Side.Double,
            flipSided: material.side === Side.Back,

            // depthPacking: (material.depthPacking !== undefined) ? material.depthPacking : false,

            // index0AttributeName: material.index0AttributeName,

            // extensionDerivatives: material.extensions && material.extensions.derivatives,
            // extensionFragDepth: material.extensions && material.extensions.fragDepth,
            // extensionDrawBuffers: material.extensions && material.extensions.drawBuffers,
            // extensionShaderTextureLOD: material.extensions && material.extensions.shaderTextureLOD,

            rendererExtensionFragDepth: this.isWebGL2,
            rendererExtensionDrawBuffers: this.isWebGL2,
            rendererExtensionShaderTextureLod: this.isWebGL2,

            // customProgramCacheKey: material.customProgramCacheKey(),
            numClipIntersection: 0,
            numClippingPlanes: 0,
            skinning: undefined,
            maxBones: 0
        };
        return parameters;

    }

    /**
     * 更具材质场景的所有参数生成Program Key  只要参数一致就可以使用同一个program 
     * @param parameters 渲染相关的所有参数
     * @returns 
     */
    getProgramCacheKey(parameters: ProgramParamters | any) {

        const array = [];

        if (parameters.shaderID) {
            array.push(parameters.shaderID);
        } else {
            array.push(parameters.fragmentShader);
            array.push(parameters.vertexShader);
        }

        if (parameters.defines !== undefined) {
            for (const name in parameters.defines) {
                array.push(name);
                array.push(parameters.defines[name]);
            }
        }

        if (parameters.shaderName === MaterialType.Raw) {

            for (const key in parameters) {
                array.push(parameters[key]);
            }
        }
        // for (let i = 0; i < parameterNames.length; i++) {
        //     array.push(parameters[parameterNames[i]]);
        // } 

        array.push(parameters.customProgramCacheKey);

        return array.join();

    }

    /**
     * 获取材质预定义的所有uniform
     * @param material 
     * @returns 
     */
    getUniforms(material: Material) {
        let uniforms;

        if (ShaderLib[material.type]) {
            const shader: any = ShaderLib[material.type];
            uniforms = shader.uniforms;
        } else {
            uniforms = material.uniforms;
        }

        return uniforms;
    }

    acquireProgram(gl: WebGL2RenderingContext, parameters: ProgramParamters, cacheKey: string) {

        let program;

        // Check if code has been already compiled
        for (let p = 0, pl = this.programs.length; p < pl; p++) {

            const preexistingProgram: GLProgram = this.programs[p] as any;

            if (preexistingProgram.cacheKey === cacheKey) {

                program = preexistingProgram;
                ++program.usedTimes;
                break;
            }

        }

        if (program === undefined) {

            program = new GLProgram(gl, parameters);
            program.cacheKey = cacheKey;
            this.programs.push(program);

        }

        return program;

    }

    releaseProgram(program: GLProgram) {

        if (--program.usedTimes === 0) {

            // Remove from unordered set
            const i = this.programs.indexOf(program);
            this.programs[i] = this.programs[this.programs.length - 1];
            this.programs.pop();

            // Free WebGL resources
            program.destroy();

        }

    }

}