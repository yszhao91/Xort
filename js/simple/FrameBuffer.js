function FrameBuffer(gl, color, depth, ext) {
	this.framebuffer
	this.init = function() {
		this.framebuffer = gl.createFramebuffer();
		this.bind();
		
		if(color.length > 1) {
			var drawBuffers = [];
			for(var i = 0; i < color.length; i++) {
				drawBuffers.push(ext["COLOR_ATTACHMENT" + i + "_WEBGL"]);
			}
			ext.drawBuffersWEBGL(drawBuffers);
			for(var i = 0; i < color.length; i++) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, ext["COLOR_ATTACHMENT" + i + "_WEBGL"],
					gl.TEXTURE_2D, color[i].texture, 0);
			}
		} else {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color[0].texture, 0);
		}
		if(depth !== undefined) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth.texture, 0);
		}
	};

	this.bind = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, self.fb);
	}
}