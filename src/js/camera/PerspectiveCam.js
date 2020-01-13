function PerspectiveCam(fov, aspect, near, far) {
	Cam.call(this);
	this.type = 'PerspectiveCam';

	this.fov = fov !== undefined ? fov : Cm.PI45;
	this.zoom = 1;

	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;
	this.aspect = aspect !== undefined ? aspect : 1;

	this.updateProjectionMat();
}

PerspectiveCam.prototype = Object.assign(Object.create(Cam.prototype), {
	constructor: PerspectiveCam,
	isPerspectiveCam: true,

	updateProjectionMat: function() {

		var near = this.near,
			top = near * Cm.tan(0.5 * this.fov) / this.zoom,
			height = 2 * top,
			width = this.aspect * height,
			left = -0.5 * width,
			view = this.view;

		this.projectionMat.makePerspective(left, left + width, top, top - height, near, this.far);

	},

});