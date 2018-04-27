function addLineNumbers(string) {

	var lines = string.split('\n');

	for(var i = 0; i < lines.length; i++) {
		lines[i] = (i + 1) + ': ' + lines[i];
	}

	return lines.join('\n');
}

function Sha(gl, type, code) {
	var shader = gl.createShader(type);

	gl.shaderSource(shader, code);

	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("THREE.WebGLShader: Shader couldn\'t compile.")
	}

	var err = gl.getShaderInfoLog(shader);
	if(err !== '') {
		var type = type === gl.VERTEX_SHADER ? 'vertex' : 'fragment';
		console.warn('THREE.WebGLShader: gl.getShaderInfoLog()',
			type,
			err,
			addLineNumbers(code));
	}

	return shader;
}