
Object.assign(Vec3.prototype, {

	isVec3: true,

	set: function(x, y, z) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	setScalar: function(scalar) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	},

	setX: function(x) {

		this.x = x;

		return this;

	},

	setY: function(y) {

		this.y = y;

		return this;

	},

	setZ: function(z) {

		this.z = z;

		return this;

	},

	setComponent: function(index, value) {

		switch(index) {

			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			case 2:
				this.z = value;
				break;
			default:
				throw new Error('index is out of range: ' + index);

		}

		return this;

	},

	getComponent: function(index) {

		switch(index) {

			case 0:
				return this.x;
			case 1:
				return this.y;
			case 2:
				return this.z;
			default:
				throw new Error('index is out of range: ' + index);

		}

	},

	clone: function() {

		return new this.constructor(this.x, this.y, this.z);

	},

	copy: function(v) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function(v, w) {

		if(w !== undefined) {

			console.warn('THREE.Vec3: .add() now only accepts one argument. Use .addVecs( a, b ) instead.');
			return this.addVecs(v, w);

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function(s) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	addVecs: function(a, b) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	addScaledVec: function(v, s) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	},

	sub: function(v, w) {

		if(w !== undefined) {

			console.warn('THREE.Vec3: .sub() now only accepts one argument. Use .subVecs( a, b ) instead.');
			return this.subVecs(v, w);

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	subScalar: function(s) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	},

	subVecs: function(a, b) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	mul: function(v, w) {

		if(w !== undefined) {

			console.warn('THREE.Vec3: .mul() now only accepts one argument. Use .mulVecs( a, b ) instead.');
			return this.mulVecs(v, w);

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	mulScalar: function(scalar) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	},

	mulVecs: function(a, b) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	applyEuler: function() {

		var quaternion = new Quat();

		return function applyEuler(euler) {

			if(!(euler && euler.isEuler)) {

				console.error('THREE.Vec3: .applyEuler() now expects an Euler rotation rather than a Vec3 and order.');

			}

			return this.applyQuat(quaternion.setFromEuler(euler));

		};

	}(),

	applyAxisAngle: function() {

		var quaternion = new Quat();

		return function applyAxisAngle(axis, angle) {

			return this.applyQuat(quaternion.setFromAxisAngle(axis, angle));

		};

	}(),

	applyMat3: function(m) {

		var x = this.x,
			y = this.y,
			z = this.z;
		var e = m.elements;

		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;

		return this;

	},

	applyMat4: function(m) {

		var x = this.x,
			y = this.y,
			z = this.z;
		var e = m.elements;

		var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

		this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
		this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
		this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

		return this;

	},

	applyQuat: function(q) {

		var x = this.x,
			y = this.y,
			z = this.z;
		var qx = q.x,
			qy = q.y,
			qz = q.z,
			qw = q.w;

		// calculate quat * vector

		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = -qx * x - qy * y - qz * z;

		// calculate result * inv quat

		this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		return this;

	},

	project: function() {

		var matrix = new Mat4();

		return function project(camera) {

			matrix.mulMatrices(camera.projectionMat, matrix.getInverse(camera.matrixWorld));
			return this.applyMat4(matrix);

		};

	}(),

	unproject: function() {

		var matrix = new Mat4();

		return function unproject(camera) {

			matrix.mulMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMat));
			return this.applyMat4(matrix);

		};

	}(),

	transformDirection: function(m) {

		// input: THREE.Mat4 affine matrix
		// vector interpreted as a direction

		var x = this.x,
			y = this.y,
			z = this.z;
		var e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8] * z;
		this.y = e[1] * x + e[5] * y + e[9] * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;

		return this.normalize();

	},

	div: function(v) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divScalar: function(scalar) {

		return this.mulScalar(1 / scalar);

	},

	min: function(v) {

		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);

		return this;

	},

	max: function(v) {

		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);

		return this;

	},

	clamp: function(min, max) {

		// assumes min < max, componentwise

		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));
		this.z = Math.max(min.z, Math.min(max.z, this.z));

		return this;

	},

	clampScalar: function() {

		var min = new Vec3();
		var max = new Vec3();

		return function clampScalar(minVal, maxVal) {

			min.set(minVal, minVal, minVal);
			max.set(maxVal, maxVal, maxVal);

			return this.clamp(min, max);

		};

	}(),

	clampLength: function(min, max) {

		var length = this.length();

		return this.divScalar(length || 1).mulScalar(Math.max(min, Math.min(max, length)));

	},

	floor: function() {

		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);

		return this;

	},

	ceil: function() {

		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);

		return this;

	},

	round: function() {

		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);

		return this;

	},

	roundToZero: function() {

		this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
		this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);

		return this;

	},

	negate: function() {

		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;

	},

	dot: function(v) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	// TODO lengthSquared?

	lengthSq: function() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	length: function() {

		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

	},

	manhattanLength: function() {

		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);

	},

	normalize: function() {

		return this.divScalar(this.length() || 1);

	},

	setLength: function(length) {

		return this.normalize().mulScalar(length);

	},

	lerp: function(v, alpha) {

		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;

		return this;

	},

	lerpVecs: function(v1, v2, alpha) {

		return this.subVecs(v2, v1).mulScalar(alpha).add(v1);

	},

	cross: function(v, w) {

		if(w !== undefined) {

			console.warn('THREE.Vec3: .cross() now only accepts one argument. Use .crossVecs( a, b ) instead.');
			return this.crossVecs(v, w);

		}

		return this.crossVecs(this, v);

	},

	crossVecs: function(a, b) {

		var ax = a.x,
			ay = a.y,
			az = a.z;
		var bx = b.x,
			by = b.y,
			bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	},

	projectOnVec: function(vector) {

		var scalar = vector.dot(this) / vector.lengthSq();

		return this.copy(vector).mulScalar(scalar);

	},

	projectOnPlane: function() {

		var v1 = new Vec3();

		return function projectOnPlane(planeNormal) {

			v1.copy(this).projectOnVec(planeNormal);

			return this.sub(v1);

		};

	}(),

	reflect: function() {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1 = new Vec3();

		return function reflect(normal) {

			return this.sub(v1.copy(normal).mulScalar(2 * this.dot(normal)));

		};

	}(),

	angleTo: function(v) {

		var theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));

		// clamp, to handle numerical problems

		return Math.acos(_Math.clamp(theta, -1, 1));

	},

	distanceTo: function(v) {

		return Math.sqrt(this.distanceToSquared(v));

	},

	distanceToSquared: function(v) {

		var dx = this.x - v.x,
			dy = this.y - v.y,
			dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	},

	manhattanDistanceTo: function(v) {

		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);

	},

	setFromSpherical: function(s) {

		var sinPhiRadius = Math.sin(s.phi) * s.radius;

		this.x = sinPhiRadius * Math.sin(s.theta);
		this.y = Math.cos(s.phi) * s.radius;
		this.z = sinPhiRadius * Math.cos(s.theta);

		return this;

	},

	setFromCylindrical: function(c) {

		this.x = c.radius * Math.sin(c.theta);
		this.y = c.y;
		this.z = c.radius * Math.cos(c.theta);

		return this;

	},

	setFromMatPosition: function(m) {

		var e = m.elements;

		this.x = e[12];
		this.y = e[13];
		this.z = e[14];

		return this;

	},

	setFromMatScale: function(m) {

		var sx = this.setFromMatColumn(m, 0).length();
		var sy = this.setFromMatColumn(m, 1).length();
		var sz = this.setFromMatColumn(m, 2).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	},

	setFromMatColumn: function(m, index) {

		return this.fromArray(m.elements, index * 4);

	},

	equals: function(v) {

		return((v.x === this.x) && (v.y === this.y) && (v.z === this.z));

	},

	fromArray: function(array, offset) {

		if(offset === undefined) offset = 0;

		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];

		return this;

	},

	toArray: function(array, offset) {

		if(array === undefined) array = [];
		if(offset === undefined) offset = 0;

		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;

		return array;

	},

	fromBufferAttribute: function(attribute, index, offset) {

		if(offset !== undefined) {

			console.warn('THREE.Vec3: offset has been removed from .fromBufferAttribute().');

		}

		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		this.z = attribute.getZ(index);

		return this;

	}

});

Vec3.create = function(x, y, z) {
	return new Vec3(x, y, z)
}

Vec3.zero = function() {
	return new Vec3(0, 0, 0)
}
Vec3.one = function() {
	return new Vec3(1, 1, 1)
}
Vec3.unitX = function() {
	return new Vec3(1, 0, 0)
}
Vec3.unitY = function() {
	return new Vec3(0, 1, 0)
}

Vec3.unitZ = function() {
	return new Vec3(0, 0, 1)
}