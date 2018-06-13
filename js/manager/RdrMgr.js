//Renderer Manager
function RdrMgr(args) {
	args = args || {};
	this.wgl = args.wgl || new Wdrer(args.wglConfig);
	var camera = this.camera = args.camera || new PerspectiveCam();
	var scene = this.scene = args.scene || new Scene();

	this.scene.add(this.camera);

	//管理器
	var geoMgr = new GeoMgr();
	var malMgr = new MalMgr();
	var lightMgr = new LightMgr();
	var geoAttrMgr = new BufAttrMgr();

	//Data Space Start-----------------------------------------	
	var wgl = this.wgl;
	var gl = this.wgl.gl;

	this.sort = true;

	var lightsArray = [];

	var _depthVector3 = Vec3.create();
	var _projScreenMat = Mat4.create();

	var opaqueObjects = [],
		transparentObjects = [];

	var bufRder = new BufRder(gl);
	var indexedBufferRder = new IndexedBufRder(gl);
	//Data Space End-----------------------------------------

	this.onframe = function() {
		wgl.clear(true, true);
		gl.clearColor(0.8, 0.9, 0.7, 1);
		gl.clearDepth(true);

		if(camera && camera.isCamera) {
			console.error("WebGLRder.onframe:这不是摄像机");
			return;
		}
		//更新场景
		if(true) scene.updateMatWorld();
		//更新摄像机
		if(camera.parent === null) camera.updateMatWorld();

		_projScreenMat.mulMats(camera.projectionMat, camera.matWorldInv)

		handeScene(scene, camera, this.sort);

		if(this.sort) {
			opaqueObjects.sort(function(a, b) {
				return a.z - b.z
			});
			transparentObjects.sort(function(a, b) {
				return b.z - a.z
			});
		}

		//不透明物体从前到后
		if(opaqueObjects.length)
			renderObjects(opaqueObjects, scene, camera);
		//透明物体从后到前
		if(transparentObjects.length)
			renderObjects(transparentObjects, scene, camera);
	}

	function handeScene(object, camera, sort) {
		if(!object.visible) return;

		if(object.isLight) {
			lightsArray.push(object);
		} else if(object.isMesh) {
			if(sort) {
				_depthVector3
					.setFromMatPosition(object.matWorld)
					.applyMat4(_projScreenMat);
			}
			var geometry = object.geometry;
			var material = object.material;

			var renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				program: material.program,
				renderOrder: object.renderOrder,
				z: _depthVector3.z,
			};
			if(material.visible) {
				if(!material.transparent)
					opaqueObjects.add(renderItem);
				else
					transparentObjects.add(renderItem);
			}
		}

		var children = object.children;
		for(let i = 0; i < children.length; i++) {
			const element = children[i];
			handeScene(element);
		}
	}

	function initMal(material, fog, object) {
		var shader = {
			name: material,
			uniforms: material.uniforms,
			vertexShader: material.vertexShader,
			fragmentShader: material.fragmentShader
		}

		var program = new Program(wgl, material, shader, null)

		material.program = program;
	}

	function getProgram(camera, fog, material, object) {
		if(material.needsUpdate) {
			initMal(material, fog, object);
			material.needsUpdate = false;
		}

		var program = material.program;
		gl.useProgram(program.program);

		return program;
	}

	function setupAttributes(material, program, geometry, startIndex) {
		//void vertexAttribPointer(uint index, int size, enum type, bool normalized, long stride, long offset);
		//type: BYTE, SHORT, UNSIGNED_{BYTE, SHORT}, FIXED, FLOAT
		//index: [0, MAX_VERTEX_ATTRIBS - 1]
		//stride: [0, 255]
		//offset, stride: must be a multiple of the type size in WebGL

	}

	function renderObjects(objects, scene, camera) {
		for(let i = 0; i < objects.length; i++) {
			const object = objects[i].object;
			const geometry = objects[i].geometry;
			const material = objects[i].material;

			//相机的视图矩阵是其模型矩阵的逆矩阵
			object.modelViewMat.mulMats(camera.matWorldInv, object.matWorld);
			object.normalMat.getNormalMat(object.modelViewMat); //

			var program = getProgram(camera, scene.fog, material, object);
			var index = geometry.index;

			var renderer = bufRder;
			if(index !== null) {
				renderer = indexedBufRder;
			}

			var program_unifroms = material.program.getUniforms(),
				program_Attributes = material.program.getAttributes(),
				material_uniforms = material.uniforms,
				geometry_attributes = geometry.attr;

			var _gl = gl;
//			gl.uniformMatrix4fv(program_unifroms['modelViewMatrix'], false, new Float32Array(object.modelViewMat.es));
//			gl.uniformMatrix4fv(program_unifroms['modelViewMatrix'], false, new Float32Array(object.modelViewMat.es));
			//void vertexAttribPointer(uint index, int size, enum type, bool normalized, long stride, long offset);
			//type: BYTE, SHORT, UNSIGNED_{BYTE, SHORT}, FIXED, FLOAT
			//index: [0, MAX_VERTEX_ATTRIBS - 1]
			//stride: [0, 255]
			//offset, stride: must be a multiple of the type size in WebGL
			for(var key in program_Attributes) {
				var program_Attribute = program_Attributes[key],
					geometry_attribute = geometry_attributes[key];
				if(program_Attribute === undefined || geometry_attribute === undefined)
					continue;

				var data = geometry_attribute.data;
				var size = geometry_attribute.size;
				var offset = geometry_attribute.offset;
				var normalized = geometry_attribute.normalized;
				var type = gl.FLOAT;

				var buffer = gl.createBuffer()
				gl.bindBuffer(GL.ARRAY_BUFFER, buffer);
				gl.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
				gl.vertexAttribPointer(program_Attribute, size, type, normalized, 0, 0);
				gl.enableVertexAttribArray(program_Attribute);
			}

			//			modelViewMatrix; // optional
			//			uniform mat4 projectionMatrix
			gl.uniformMatrix4fv(program_unifroms['modelViewMatrix'], false, new Float32Array(object.modelViewMat.es));
			gl.uniformMatrix4fv(program_unifroms['projectionMatrix'], false, new Float32Array(camera.projectionMat.es));
			for(var key in material_uniforms) {
				gl.uniform1f(program_unifroms[key], material_uniforms[key].value);
			}
			//绑定属性值
			//setupAttributes(material, program, geometry);

			//			if(object.isMesh) {
			//				renderer.setMode(gl.TRIANGLES);
			//			}

			renderer.draw(gl.TRIANGLES, 0, 3);
		}
	}

}