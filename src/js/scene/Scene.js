export class Scene extends Thing {
	constructor() {
		super();
		this.cameras = {};
		this.defaultCamera = null;
	}

	set CurrentCameram(camera) {
		if (this.cameras.indexOf(camera) === -1)
			this.cameras[camera.name||camera.id]
	}
} 