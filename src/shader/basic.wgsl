
struct CommonUniforms {   
    view_projection_mat: mat4x4<f32>,
    model_mat: mat4x4<f32>,                  
    view_mat: mat4x4<f32>,                        
    normal_mat: mat4x4<f32>,   
    projection_mat: mat4x4<f32>,   
    color: vec4<f32>
};
@binding(0) @group(0) var<uniform> uniforms : CommonUniforms;

struct Input {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec4<f32>,
    @location(2) color: vec3<f32>,
    @location(3) uv: vec3<f32>,
};

struct Output {
    @builtin(position) position: vec4<f32>,
    @location(0) v_position: vec4<f32>,
    @location(1) v_normal: vec4<f32>,
    @location(2) v_color: vec2<f32>,
    @location(3) v_uv: vec2<f32>,
};

@stage(vertex)
fn vs_main(in: Input) -> Output {
    var output: Output;
    let m_position:vec4<f32> = uniforms.model_mat * vec4<f32>(in.position, 1.0);
    output.v_position = m_position;
    output.v_normal = uniforms.normal_mat * in.normal;
    output.position = uniforms.view_projection_mat * m_position;
    output.v_color = in.color;
    return output;
}




// fragment shader 

struct FragUniforms {
    light_position: vec4<f32>,  
    eye_position: vec4<f32>,
};
@binding(1) @group(0) var<uniform> frag_uniforms : FragUniforms; 
@binding(2) @group(0) var mapSampler : sampler;
@binding(3) @group(0) var mapData : texture_2d<f32>;
struct LightUniforms {
    specular_color: vec4<f32>,
    params: vec4<f32>, // ambient_intensity, diffuse_intensity, specular_intensity, specular_shininess
    param2: vec4<f32>, // is _two_side
};
@binding(2) @group(0) var<uniform> light_uniforms : LightUniforms;

@stage(fragment)
fn fs_main(in: Output) -> @location(0) vec4<f32> {
    let mapColor:vec4<f32> = textureSample(mapData, mapSampler, in.v_uv);
    let finalColor:vec4<f32> = vec4(in.v_color, 1.0); 
    return vec4<f32>(finalColor.rgb, 1.0);
}
