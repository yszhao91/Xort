function Program(wgl, material, shader, parameters) {
	var gl = wgl.gl;
	var program = gl.createProgram();

	var vertexShader = shader.vertexShader;
	var fragmentShader = shader.fragmentShader;
	//生成shader脚本前缀//可以有重复的uniform,但是要保证相同的精度
	var prefixVertex, prefixFrament;

	if(material.isRawShaMal) {
		prefixVertex = "";
		prefixFrament = "";
	} else {
		prefixVertex = [
			'precision ' + parameters.precision + ' float;',
			'precision ' + parameters.precision + ' int;',

			'#defube SHADER_NAME ' + shader.name,

			parameters.map ? '#define USE_MAP' : '',

			'uniform mat4 modelMatrix;',
			'uniform mat4 modelViewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 viewMatrix;',
			'uniform mat3 normalMatrix;',
			'uniform vec3 cameraPosition;',

			'attribute vec3 position;',
			'attribute vec3 normal;',
			'attribute vec2 uv;',
		].join('\n');

		prefixFrament = [
			'precision ' + parameters.precision + ' float;',
			'precision ' + parameters.precision + ' int;',

			'#define SHADER_NAME ' + shader.name,

			parameters.map ? '#define USE_MAP' : '',

			'uniform mat4 viewMatrix;',
			'uniform vec3 cameraPosition;',
		].join('\n');
	}

	var allVertex = prefixVertex + vertexShader;
	var allFragment = prefixFrament + fragmentShader;

	var vertexShader = Sha(gl, gl.VERTEX_SHADER, allVertex);
	var fragmentShader = Sha(gl, gl.FRAGMENT_SHADER, allFragment);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	var programLog = gl.getProgramInfoLog(program);
	var vertexLog = gl.getShaderInfoLog(vertexShader);
	var fragmentLog = gl.getShaderInfoLog(fragmentShader);

	var runnable = true;
	var haveDiagnostics = true;
	if(gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
		runnable = false;
		console.error('THREE.WebGLProgram: shader 错误: ',
			gl.getError(), 'gl.VALIDATE_STATUS',
			gl.getProgramParameter(program, gl.VALIDATE_STATUS),
			'gl.getProgramInfoLog',
			programLog,
			vertexLog,
			fragmentLog);

	} else if(programLog !== '') {
		console.warn('THREE.WebGLProgram: gl.getProgramInfoLog()', programLog);
	} else if(vertexLog === '' || fragmentLog === '') {
		haveDiagnostics = false;
		//console.error('THREE.WebGLProgram:' + "错误不能被诊断")
	}

	this.getUniforms = function() {
		var uniforms = {};

		var activeUniformNum = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

		for(var i = 0; i < activeUniformNum; ++i) {
			var info = gl.getActiveUniform(program, i),
				name = info.name;
			uniforms[name] = gl.getUniformLocation(program, name);
		}

		return uniforms;
	}

	this.getAttributes = function() {
		var attributes = {};

		var activeAttributeNum = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

		for(var i = 0; i < activeAttributeNum; i++) {
			var info = gl.getActiveAttrib(program, i);
			var name = info.name;
			attributes[name] = gl.getAttribLocation(program, name);
		}

		return attributes;
	}

	this.clear = function() {
		gl.deleteProgram(program);
		this.program = undefined;
	}

	//	this.id = programId++;
	this.program = program;
	this.vertexShader = vertexShader;
	this.fragmentShader = fragmentShader;
	this.glslvertex = allVertex;
	this.glslfragment = allFragment;

	return this;
}