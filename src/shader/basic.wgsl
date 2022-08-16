
struct TransformUniform {     
    modelMatrix: mat4x4<f32>;
    modelViewMatrix: mat4x4<f32>;
    projectionMatrix: mat4x4<f32>;
    viewMatrix: mat4x4<f32>;
    normalMatrix: mat3x3<f32>;
    cameraPosition: vec3<f32>;
}


struct Map {
    map: texture_2d<f32>; 
    samp: sampler;
}

struct AoMap {
    map: texture_2d<f32>;
    intensity: f32; 
    samp: sampler;
}
 

struct LightMap {
    map: texture_2d<f32>;
    intensity: f32; 
    samp: sampler;
}

struct DisplacementMap {
    map: texture_2d<f32>;
    basic: f32;
    scale: vec2<f32>;
    samp: sampler;
}

struct NormalMap {
    map: texture_2d<f32>;
    scale: vec2<f32>; 
    samp: sampler;
}

struct RoughnessMap {
    map: texture_2d<f32>; 
    samp: sampler;
}

struct MetalnessMap {
    map: texture_2d<f32>; 
    samp: sampler;
}
struct AlphaMap {
    map: texture_2d<f32>; 
    samp: sampler;
}
struct EnvMap {
    map: texture_2d<f32>;
    intensity: f32; 
    samp: sampler;
}
  
struct GeometryInput {
    @location(0) position: vec3<f32>;
    @location(1) normal: vec3<f32>;
    @location(2) uv: vec2<f32>;
    @location(3) color: vec3<f32>;
    @location(4) uv2: vec2<f32>;
    @location(5) tabgent: vec3<f32>;
};

 
struct Output {
    @builtin(position) v_position: vec4<f32>; 
    @location(0) v_normal: vec3<f32>;
    @location(1) v_color: vec4<f32>;
    @location(2) v_uv: vec2<f32>;
    @location(3) isPerspective: bool; 
};

fn isPerspectiveMatrix(m: mat4x4<f32>) {
    return m[ 2 ][ 3 ] == - 1.0;
}

@binding(0) @group(0) var<uniform> transform:TransformUniform; 

@vertex
fn vs_main(in: GeometryInput) -> Output {
    var output:Output;
    output.v_position = transform.projectionMatrix * transform.modelViewMatrix * vec3(in.position, 1.0);
    output.v_normal = transform.normalMatrix * in.normal;
    output.v_uv = in.uv;
    output.isPerspective = isPerspectiveMatrix(transform.projectionMatrix);
    output.v_color = vec4<f32>(1.0);
    return output;
}



// fragment shader 
struct PointLight {
    position: vec3<f32>;
    color: vec3<f32>;
    decay: f32;
}

struct SpotLight {
    position: vec3<f32>;
    color: vec3<f32>;
    decay: f32;
}


struct DirectionalLight {
	  direction: vec3<f32>;
	  color: vec3<f32>;
};

struct IncidentLight {
    color: vec3<f32>;
	direction: vec3<f32>;
	visible: bool;
};

struct ReflectedLight {
	directDiffuse: vec3<f32>;
	directSpecular: vec3<f32>;
	indirectDiffuse: vec3<f32>;
	indirectSpecular: vec3<f32>;
};
  