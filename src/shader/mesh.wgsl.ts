export const vertexShader = `
struct TransformUniform {     
    modelMatrix: mat4x4<f32>,
    // modelViewMatrix: mat4x4<f32>,
    // projectionMatrix: mat4x4<f32>,
    // viewMatrix: mat4x4<f32>,
    // normalMatrix: mat3x3<f32>,
    // cameraPosition: vec3<f32>,
}

#Place{GeometryInput}
// struct GeometryInput {
//     @location(0) position: vec3<f32>,
//     @location(1) normal: vec3<f32>,
//     @location(2) uv: vec2<f32>,
//     @location(3) color: vec3<f32>,
//     @location(4) uv2: vec2<f32>,
//     @location(5) tangent: vec3<f32>,
// };

 
struct Output {
    @builtin(position) position: vec4<f32>, 
    @location(0) v_normal: vec3<f32>,
    @location(1) v_color: vec4<f32>,
    @location(2) v_uv: vec2<f32>,
    // @location(3) isPerspective: bool, 
};

fn isPerspectiveMatrix(m: mat4x4<f32>)->bool {
    return m[ 2 ][ 3 ] == - 1.0;
}

@binding(0) @group(0) 
var<uniform> transform:TransformUniform; 

@vertex
fn main(in: GeometryInput) -> Output {
    var output:Output;
    output.position = vec4(in.position, 1.0);
    // output.position = transform. projectionMatrix * transform.modelViewMatrix * vec4(in.position, 1.0);
    // output.v_normal = transform.normalMatrix * in.normal;
    // output.v_uv = in.uv;
    // // output.isPerspective = isPerspectiveMatrix(transform.projectionMatrix);
    output.v_color = vec4<f32>(1.0,1.0,1.0,1.0);
    return output;
} `


export const fragmentShader = `
 
struct Input {
    @builtin(position) v_position: vec4<f32>, 
    @location(0) v_normal: vec3<f32>,
    @location(1) v_color: vec4<f32>,
    @location(2) v_uv: vec2<f32>,
    // @location(3) isPerspective: bool, 
};

@fragment
fn main(input: Input) -> @location(0) vec4<f32> {
    return vec4<f32>(1.0,0.0,0.0,1.0);
}`