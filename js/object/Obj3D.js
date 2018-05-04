var Obj3DCount = 0;

function Obj3D() {
	ObjNode.call(this)
	var self = this;

	this.id = Obj3DCount++;
	this.position = Vec3.zero();
	this.scale = Vec3.one();
	this.rotate = Vec3.zero();
	this.quat = new Quat();

	this.mat = new Mat4();
	this.matWorld = new Mat4();
	this.modelViewMat = new Mat4();
	this.normalMat = new Mat3();

	this.up = Vec3.unitY();

	this.visible = true;

	//视角剔除
	this.viewCulled = true;
}

Obj3D.prototype = Object.assign(Object.create(ObjNode.prototype), {
	constructor: Obj3D,
	isObj3D: true,

	updateMat: function() {
		this.mat.compose(this.position, this.quat, this.scale);

		this.matrixWorldNeedsUpdate = true;
	},

	updateMatWorld: function(force) {
		this.updateMat();

		if(this.parent === null) {
			this.matWorld.copy(this.mat);
		} else {
			this.matWorld.mulMats(this.parent.matWorld, this.mat);
		}

		var children = this.children;
		for(var i = 0, l = children.length; i < l; i++) {
			children[i].updateMatWorld(force);
		}
	},

	lookAt: function(target) {
		var m1 = new Mat4()
		if(this.isCamera)
			m1.lookAt(this.position, target, this.up);

		this.quat.setFromRotationMat(m1)
	},
});