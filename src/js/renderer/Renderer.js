export class Renderer {
	constructor(args = { glID: "webgl2" }) {

		this.domElement = args.domElement || document.createElement("canvas");

		this.attributes = {
			//			alpha: false,
			//			depth: true,
			//			stencil: _stencil,
			antialias: true,
			//			premultipliedAlpha: _premultipliedAlpha,
			//			preserveDrawingBuffer: _preserveDrawingBuffer,
			//			powerPreference: _powerPreference
		};

		//属性 开始---------------------------------
		this.gl = this.domElement.getContext(glID, attributes);
		this.version = this.gl.toString()[13] === "R" ? "1" : this.gl.toString()[13];
		this.width = this.domElement.width;
		this.height = this.domElement.height;
		//属性 结束---------------------------------

	}


	setSize(width, height) {
		this.domElement.width = width;
		this.domElement.height = height;
		this.gl.viewport(0, 0, width, height);
	}

	clear(color, depth, stencil) {
		var bits = 0;

		if (color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
		if (depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
		if (stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;

		this.gl.clear(bits);
	};

	setSize(width, height) {
		this.gl.viewport(0, 0, width, height);
	}

	render() {

	}

	renderBuffer(buffer) {
		const type = buffer.type ? TRIANGLES : buffer.type;

		if (buffer.elementType || buffer.indices)
		{
			if (instanceCount != undefined)
			{
				this.gl.drawElementsInstanced()
			} else
			{
				this.gl.drawElements()
			}
		} else
		{
			if (instanceCount != undefined)
			{
				this.gl.drawElementsInstanced()
			} else
			{
				this.gl.drawElements()
			}
		}
	}
} 