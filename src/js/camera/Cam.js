//Camera 摄像机
function Cam() {
  Obj3D.call(this);
  this.type = "Cam";
  this.matWorldInv = new Mat4();
  this.projectionMat = new Mat4();
}

Cam.prototype = Object.assign(Object.create(Obj3D.prototype), {
  constructor: Cam,
  isCam: true,

  updateMatWorld: function(force) {
    Obj3D.prototype.updateMatWorld.call(this, force);
    this.matWorldInv.getInv(this.matWorld);
  },
  
  updateProjectionMat:function () {
  	
  },
});
