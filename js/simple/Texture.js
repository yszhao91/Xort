function Texture(gl, index, data, width, height, options) {
	var self = this;
	options = options || {};
	options.target = options.target || gl.TEXTURE_2D;
	options.mag = options.mag || gl.NEAREST;
	options.min = options.min || gl.NEAREST;
	options.wraps = options.wraps || gl.CLAMP_TO_EDGE;
	options.wrapt = options.wrapt || gl.CLAMP_TO_EDGE;
	options.internalFormat = options.internalFormat || gl.RGBA;
	options.format = options.format || gl.RGBA;
	options.type = options.type || gl.UNSIGNED_BYTE;

	this.init = function() {
		this.index = index;
		gl.activeTexture(gl.TEXTURE0 + self.index);
		this.texture = gl.createTexture();
		gl.bindTexture(options.target, self.texture);
		gl.texImage2D(options.target, 0, options.internalFormat, options.format, options.type, data);
		gl.texParameteri(options.target, gl.TEXTURE_MAG_FILTER, options.mag);
		gl.texParameteri(options.target, gl.TEXTURE_MIN_FILTER, options.min);
		gl.texParameteri(options.target, gl.TEXTURE_WRAP_S, options.wraps);
		gl.texParameteri(options.target, gl.TEXTURE_WRAP_T, options.wrapt);
		if(options.mag != gl.NEAREST || options.min != gl.NEAREST) {
			gl.generateMipmap(options.target);
		}
	}

	self.bind = function() {
		gl.bindTexture(options.target, self.texture);
	};

	this.active = function() {
		gl.activeTexture(gl.TEXTURE0 + self.index);
	}

	this.reset = function() {
		gl.activeTexture(gl.TEXTURE0 + self.index);
		gl.bindTexture(options.target, self.texture);
		gl.texImage2D(options.target, 0, options.internalFormat, width, height,
			0, options.format, options.type, data);
	}
}