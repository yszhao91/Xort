function Mesh(geometry,material) {
	Obj3D.call(this);

	this.geometry = geometry
	this.material = material
};

Mesh.prototype = Object.assign(Object.create(Obj3D.prototype), {
	constructor: Mesh,
	isMesh: true
});