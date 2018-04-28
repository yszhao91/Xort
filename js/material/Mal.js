//Mal——>Material 材质
var malCount = 0;

function Mal() {
	this.type = "Mal";
	this.id = malCount++;

	this.fog = true;
	this.lights = true;

	this.side = null;
	this.flatShading = false;
	this.vertexColors = null; // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

	this.opacity = 1;
	this.transparent = false;

	this.blendSrc = null;
	this.blendDst = null;
	this.blendEquation = null;
	this.blendSrcAlpha = null;
	this.blendDstAlpha = null;
	this.blendEquationAlpha = null;

	this.depthFunc = null;
	this.depthTest = true;
	this.depthWrite = true;

	this.map = null;

	this.visible = true;
	this.needsUpdate = true;
}
Mal.prototype = {
	constructor: Mal,

	isMal: true,

	setValues: function(values) {
		if(!values) return;

		for(var key in values) {
			var newValue = values[key];
			if(!newValue) {
				console.warn("Mal: '" + key + "' parameter is undefined.");
				continue;
			}
			this[key] = newValue;
		}
	}
}