function Wdrer(args) {
	args = args || {};

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

	//属性 开始---------------------------------
	var gl = this.gl = this.domElement.getContext("webgl", attributes);
	this.version = this.gl.toString()[13] === "R" ? "1" : this.gl.toString()[13];
	this.width = this.domElement.width;
	this.height = this.domElement.height;
	//属性 结束---------------------------------

	this.setSize = function(width, height) {
		this.domElement.width = width;
		this.domElement.height = height;
		gl.viewport(0, 0, width, height);
	}

	this.clear = function(color, depth, stencil) {

		var bits = 0;

		if(color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
		if(depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
		if(stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;

		gl.clear(bits);

	};

}
Wdrer.prototype = {};