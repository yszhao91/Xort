function BufAttr(data, unitSize, normalized) {
	this.uuid = Cm.uuid();

	this.name = "";

	this.data = data;
	this.size = unitSize;
	this.length = !data ? 0 : data.length / unitSize;
	this.normalized = !!normalized;
	this.offset = 0;
	
	this.dynamic = false;
}

Object.assign(BufAttr.prototype, {
	isBufAttr: true,

	setData: function(data) {
		this.count = data !== undefined ? data.length / this.itemSize : 0;
		this.data = data;
	}
});

function Int8BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Int8Array(array), itemSize, normalized);
}

Int8BufAttr.prototype = Object.create(BufAttr.prototype);
Int8BufAttr.prototype.constructor = Int8BufAttr;

function Uint8BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Uint8Array(array), itemSize, normalized);
}

Uint8BufAttr.prototype = Object.create(BufAttr.prototype);
Uint8BufAttr.prototype.constructor = Uint8BufAttr;

function Uint8ClampedBufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Uint8ClampedArray(array), itemSize, normalized);
}

Uint8ClampedBufAttr.prototype = Object.create(BufAttr.prototype);
Uint8ClampedBufAttr.prototype.constructor = Uint8ClampedBufAttr;

function Int16BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Int16Array(array), itemSize, normalized);
}

Int16BufAttr.prototype = Object.create(BufAttr.prototype);
Int16BufAttr.prototype.constructor = Int16BufAttr;

function Uint16BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Uint16Array(array), itemSize, normalized);
}

Uint16BufAttr.prototype = Object.create(BufAttr.prototype);
Uint16BufAttr.prototype.constructor = Uint16BufAttr;

function Int32BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Int32Array(array), itemSize, normalized);
}

Int32BufAttr.prototype = Object.create(BufAttr.prototype);
Int32BufAttr.prototype.constructor = Int32BufAttr;

function Uint32BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Uint32Array(array), itemSize, normalized);
}

Uint32BufAttr.prototype = Object.create(BufAttr.prototype);
Uint32BufAttr.prototype.constructor = Uint32BufAttr;

function Float32BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Float32Array(array), itemSize, normalized);
}

Float32BufAttr.prototype = Object.create(BufAttr.prototype);
Float32BufAttr.prototype.constructor = Float32BufAttr;

function Float64BufAttr(array, itemSize, normalized) {
	BufAttr.call(this, new Float64Array(array), itemSize, normalized);
}

Float64BufAttr.prototype = Object.create(BufAttr.prototype);
Float64BufAttr.prototype.constructor = Float64BufAttr;