struct Output {
    @builtin(position) Position: vec4<f32>;
    @location(0) vColor: vec4<f32>;
}

@vertex
fn vs_main(@location(0) pos:vec4<f32>, @location(1) color:vec4<f32>) -> Output {  
    var output:Output; 
    output.Position = pos;
    output.vColor = color;
    return output;
}

@fragment
fn fs_main(@location(0) vColor:vec4<f32>)->@location(0) vec4<f32>{
    return vColor;
}

