function BufferAttribute(data, unitSize, normalized) {
	this.uuid = Cm.uuid();

	this.name = "";

	this.data = data;
	this.size = unitSize;
	this.length = !data ? 0 : data.length / unitSize;
	this.normalized = !!normalized;
	this.offset = 0;

	this.dynamic = false;
}

Object.assign(BufferAttribute.prototype, {
	isBufferAttribute: true,

	setData: function (data) {
		this.count = data !== undefined ? data.length / this.itemSize : 0;
		this.data = data;
	}
});

function Int8BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Int8Array(array), itemSize, normalized);
}

Int8BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Int8BufferAttribute.prototype.constructor = Int8BufferAttribute;

function Uint8BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Uint8Array(array), itemSize, normalized);
}

Uint8BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Uint8BufferAttribute.prototype.constructor = Uint8BufferAttribute;

function Uint8ClampedBufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Uint8ClampedArray(array), itemSize, normalized);
}

Uint8ClampedBufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Uint8ClampedBufferAttribute.prototype.constructor = Uint8ClampedBufferAttribute;

function Int16BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Int16Array(array), itemSize, normalized);
}

Int16BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Int16BufferAttribute.prototype.constructor = Int16BufferAttribute;

function Uint16BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Uint16Array(array), itemSize, normalized);
}

Uint16BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Uint16BufferAttribute.prototype.constructor = Uint16BufferAttribute;

function Int32BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Int32Array(array), itemSize, normalized);
}

Int32BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Int32BufferAttribute.prototype.constructor = Int32BufferAttribute;

function Uint32BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Uint32Array(array), itemSize, normalized);
}

Uint32BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Uint32BufferAttribute.prototype.constructor = Uint32BufferAttribute;

function Float32BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Float32Array(array), itemSize, normalized);
}

Float32BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Float32BufferAttribute.prototype.constructor = Float32BufferAttribute;

function Float64BufferAttribute(array, itemSize, normalized) {
	BufferAttribute.call(this, new Float64Array(array), itemSize, normalized);
}

Float64BufferAttribute.prototype = Object.create(BufferAttribute.prototype);
Float64BufferAttribute.prototype.constructor = Float64BufferAttribute;