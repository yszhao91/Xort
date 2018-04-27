function WebGLRder(args) {
	args = args || {};
	var mine = this;

	this.domElement = args.domElement || document.createElement("canvas");
	var attributes = {
		//			alpha: false,
		//			depth: true,
		//			stencil: _stencil,
		antialias: true,
		//			premultipliedAlpha: _premultipliedAlpha,
		//			preserveDrawingBuffer: _preserveDrawingBuffer,
		//			powerPreference: _powerPreference
	};

	var gl = this.domElement.getContext("webgl2", attributes) || this.domElement.getContext("webgl", attributes);
	this.gl = gl;

	this.version = gl.toString()[13] === "R" ? "1" : gl.toString()[13];
	//Data Space Start-----------------------------------------
	this.sort = true;
	
	var lightsArray = []; 
	
	var _depthVector3 = Vec3.create();
	var _projScreenMat = Mat4.create();
	
	var opaqueObjects = [],
		transparentObjects = [];
		
	var bufRder = new BufRder(gl);
	var indexedBufferRder = new IndexedBufRder(gl);
	//Data Space End-----------------------------------------

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

	this.onframe = function(scene, camera) {
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

	function initMal(material, fog, object) {
		var shader = {
			name: material,
			uniforms: material.uniforms,
			vertexShader: material.vertexShader,
			fragmentShader: material.fragmentShader
		}

		var program = new Program(mine, material, shader, null)

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
		//		var geometryAttributes = geometry.attributes;
		//
		//		var programAttributes = program.getAttributes();
		//
		//		var materialDefaultAttributeValues = material.defaultAttributeValues;
		//		for(const name in programAttributes) {
		//			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		//			gl.vertexAttribPointer(
		//				programAttributes,
		//				size,
		//				type,
		//				normalized,
		//				stride,
		//				offset
		//			);
		//		}
	}

	function renderObjects(objects, scene, camera) {
		for(let i = 0; i < objects.length; i++) {
			const object = objects[i].object;
			const geometry = objects[i].geometry;
			const material = objects[i].material;

			object.modelViewMat.mulMats(camera.matWorldInv, object.matWorld);
			object.normalMat.getNormalMat(object.modelViewMat);

			var program = getProgram(camera, scene.fog, material, object);
			var index = geometry.index;

			var renderer = bufRder;
			if(index !== null) {
				renderer = indexedBufRder;
			}

			var program_unifroms = material.program.getUniforms(),
				program_Attributes = material.program.getAttributes(),
				material_uniforms = material.uniforms,
				geometry_attribute = geometry.attr;

			//			gl.uniformMatrix4fv(program_unifroms[], false, mat4array);

			//绑定属性值
			setupAttributes(material, program, geometry);

			if(object.isMesh) {
				//				renderer.setMode(renderer.drawMode);
			}

			//			renderer.draw();
		}
	}
}
WebGLRder.prototype = {};