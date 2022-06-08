export const vertexShader = ` 
struct TransformUniform {     
    modelMatrix: mat4x4<f32>,
    modelViewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
    cameraPosition: vec3<f32>,
}

struct Output {
    @builtin(position) v_position: vec4<f32>,
    @location(2) v_color: vec4<f32>,
    @location(1) v_uv: vec2<f32>
}

struct GeometryInput {
    @location(0) position: vec4<f32>,
    @location(2) color: vec4<f32>,
    // @location(2) normal: vec3<f32>,// input、的数据必须和代码传入数据一样多，而vertex到fragment可以不用
    // @location(3) uv: vec2<f32>,  
};

@stage(vertex)
fn vs_main(in: GeometryInput) -> Output {  
    var output:Output; 
    output.v_position = in.position;
    output.v_color = in.color;
    return output;
} `


export const fragmentShader = ` 
struct Input { 
    @location(2) v_color: vec4<f32>, 
    @location(1) v_uv: vec2<f32>
};
@stage(fragment)
fn fs_main(input:Input)->@location(0) vec4<f32>{
    return input.v_color;
}`