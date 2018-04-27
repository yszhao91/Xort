function AmbLight() {
  Light.call(this);

  this.type = "AmbLight";
}
AmbLight.prototype = Object.assign(Object.create(Light.prototype), {
	constructor: AmbLight,
	isAmbLight: true
  });
  