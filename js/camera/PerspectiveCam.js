function PerspectiveCam() {
	Cam.call(this)
}

PerspectiveCam.prototype = Object.assign(Object.create(Cam.prototype), {
	constructor: PerspectiveCam,
	isPerspectiveCam: true
});