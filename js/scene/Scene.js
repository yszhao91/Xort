function Scene() {
	Obj3D.call(this);
	this.type = 'Scene';

	this.fog = null;
};

Scene.prototype = Object.assign(Object.create(Obj3D.prototype), {
	constructor: Scene,
	isScene: true
});