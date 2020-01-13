var DirLight = function() {
  Light.call(this);

  this.type = "DirLight";
};

DirLight.prototype = Object.assign(Object.create(Light.prototype), {
  constructor: DirLight,
  isDirLight: true
});
