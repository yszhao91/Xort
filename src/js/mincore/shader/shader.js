import { uniformlibs } from "./unifroms"
export const basic = {

    uniforms: mergeUniforms([
        uniformlibs.common,
        uniformlibs.specularmap,
        uniformlibs.envmap,
        uniformlibs.aomap,
        uniformlibs.lightmap,
        uniformlibs.fog
    ]),

    vertexShader: ShaderChunk.meshbasic_vert,
    fragmentShader: ShaderChunk.meshbasic_frag

}

export const standard = {

    uniforms: mergeUniforms([
        uniformlibs.common,
        uniformlibs.envmap,
        uniformlibs.aomap,
        uniformlibs.lightmap,
        uniformlibs.emissivemap,
        uniformlibs.bumpmap,
        uniformlibs.normalmap,
        uniformlibs.displacementmap,
        uniformlibs.roughnessmap,
        uniformlibs.metalnessmap,
        uniformlibs.fog,
        uniformlibs.lights,
        {
            emissive: {
                value: new Color(0x000000)
            },
            roughness: { value: 1.0 },
            metalness: { value: 0.0 },
            envMapIntensity: { value: 1 } // temporary
        }
    ]),

    vertexShader: ShaderChunk.meshphysical_vert,
    fragmentShader: ShaderChunk.meshphysical_frag

}

export const physical = {

    uniforms: mergeUniforms({
        ...ShaderLib.standard.uniforms,
        clearcoat: { value: 0 },
        clearcoatMap: { value: null },
        clearcoatRoughness: { value: 0 },
        clearcoatRoughnessMap: { value: null },
        clearcoatNormalScale: { value: new Vector2(1, 1) },
        clearcoatNormalMap: { value: null },
        sheen: { value: new Color(0x000000) },
        transparency: { value: 0 },

    }),

    vertexShader: ShaderChunk.meshphysical_vert,
    fragmentShader: ShaderChunk.meshphysical_frag

}