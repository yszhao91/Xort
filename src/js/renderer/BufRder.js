function BufRder(gl, extensions, infoRender) {

	this.draw = function(mode, start, count) {
		gl.drawArrays(mode, start, count);

		//		if(mode === gl.TRIANGLES) infoRender.faces += count / 3;
		//		else if(mode === gl.POINTS) infoRender.points += count;
	}

	this.renderInstances = function(geometry, start, count) {
		var extension = extensions.get('ANGLE_instanced_arrays');

		if(extension === null) {

			console.error('THREE.WebGLBufRder: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
			return;

		}

		var position = geometry.attributes.position;

		if(position.isInterleavedBufferAttribute) {

			count = position.data.count;

			extension.drawArraysInstancedANGLE(mode, 0, count, geometry.maxInstancedCount);

		} else {

			extension.drawArraysInstancedANGLE(mode, start, count, geometry.maxInstancedCount);

		}

		infoRender.calls++;
		infoRender.vertices += count * geometry.maxInstancedCount;

		if(mode === gl.TRIANGLES) infoRender.faces += geometry.maxInstancedCount * count / 3;
		else if(mode === gl.POINTS) infoRender.points += geometry.maxInstancedCount * count;

	}
}