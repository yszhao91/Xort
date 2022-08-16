export const vertexShader = ` 
struct GeometryInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,  
};

 
struct Output {
    @builtin(position) v_position: vec4<f32>, 
    @location(0) v_normal: vec3<f32>,
    @location(1) v_color: vec4<f32>,
    @location(2) v_uv: vec2<f32>, 
};
  
@vertex
fn main(in: GeometryInput) -> Output {
    var output:Output;
    output.v_position = vec4<f32>(in.position, 1.0);
    output.v_normal = in.normal;
    output.v_uv = in.uv;
    output.v_color = vec4<f32>(1.0,1.0,1.0,1.0);
    return output;
} `


export const fragmentShader = `
 
struct Input { 
    @location(0) v_normal: vec3<f32>,
    @location(1) v_color: vec4<f32>,
    @location(2) v_uv: vec2<f32>,
    // @location(3) isPerspective: bool, 
};

@fragment
fn main(input:Input) ->@location(0) vec4<f32> {
    return input.v_color;
}`