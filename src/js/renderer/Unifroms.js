function Uniforms(gl, program, renderer) {
	this.renderer = renderer;

	var n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	for(var i = 0; i < n; ++i) {

		var info = gl.getActiveUniform(program, i),
			path = info.name,
			addr = gl.getUniformLocation(program, path);
 

	}
}