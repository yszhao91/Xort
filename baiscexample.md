需要：
canvas
adapter = navigator.gpu.requestAdapater();
device = adapter.requestDevice();
context = canvas.getContext('webgpu');
context.configure({})

commandEncoder = device.createCommonEncoder();

textureView = context.getCurrentTexture().getView();



builtin
vertex_index vertex	input	u32
instance_index	vertex	input	u32
position	vertex	output	vec4<f32>
position	fragment	input	vec4<f32>
front_facing	fragment	input	bool
frag_depth	fragment	output	f32
local_invocation_id	compute	input	vec3<u32>
local_invocation_index	compute	input	u32
global_invocation_id	compute	input	vec3<u32>	 
workgroup_id	compute	input	vec3<u32> 
num_workgroups	compute	input	vec3<u32>	 
sample_index	fragment	input	 
sample_mask	fragment	input	u32	 
sample_mask	fragment	output	u32