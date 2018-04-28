function BufAttrMgr(gl) {
	var buffers = {};

	//target: ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER,
	function createBuffer(attr, target) {
		var data = attr.data;
		var usage = attr.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		var buffer = gl.createBuffer();
		gl.bindBuffer(target, buffer);
		gl.bufferData(target, data, usage);

		var type = gl.FLOAT;
		if(data instanceof Float32Array) {
			type = gl.FLOAT;
		} else if(data instanceof Float64Array) {
			console.warn("BufAttrMgs:不支持Float64Array")
		} else if(data instanceof Uint16Array) {
			type = gl.UNSIGNED_SHORT;
		} else if(data instanceof Int16Array) {
			type = gl.SHORT;
		} else if(data instanceof Uint32Array) {
			type = gl.UNSIGNED_INT;
		} else if(data instanceof Int32Array) {
			type = gl.INT;
		} else if(data instanceof Int8Array) {
			type = gl.BYTE;
		} else if(data instanceof Uint8Array) {
			type = gl.UNSIGNED_BYTE;
		}

		return {
			buf: buffer,
			type: type,
			bytesPerElement: data.BYTES_PER_ELEMENT,
			ver: attr.ver
		}
	}

	function updateBuffer(buffer, attribute, target) {
		var array = attribute.data;
		var updateRange = attribute.updateRange;

		gl.bindBuffer(target, buffer);
		
	}

	function update(attr, target) {
		var data = buffers[attribute.uuid];

		if(!data) {
			buffers[attr.uuid] = createBuffer(attr, target);
		} else if(data.ver < attr.ver) {
			updateBuffer(data.buffer, attr, target);
			data.ver = attr.ver;
		}
	}

}