
var NPType={
	Coplanar: 0,
	Positive: 1,
	Negitive: 2, 
}
function Plane(normal, w) {
  this.normal =
    normal !== undefined ? normal.normalize() : new Vector3(1, 0, 0);
  this.w = w !== undefined ? w : 0;
}

Plane.prototype = {
  distancePoint: function(p) {
    return p.dot(this.normal) + this.w;
  },

  toThreePlane: function() {
    return new THREE.Plane(this.normal, this.w);
  },

  inPlane: function(p, precision) {
    return Math.abs(this.distancePoint(p)) < (precision || midprecison);
  },

  //判断一个是在平面的正面还是反面
  porn:function (point) {
    var np = this.distancePoint(point);
    if(Math.abs(np) < 1e-8)
        return NPType.Coplanar;
    else if(np < 0)
        return NPType.Negitive;
    else if(np > 0)
        return NPType.Positive;
  },
  
  lerp:function(v1,v2){ 
    var d1 = Cm.abs(this.distanceToPoint(v1));
    var d2 = Cm.abs(this.distanceToPoint(v2));

    return {
        ratio: d1 / (d1 + d2), 
        invratio: d2 / (d1 + d2),
    }
  },
};

Plane.fromPN = function(postion, normal) {
  //p*n-w=0
  var w = -normal.normalize().dot(postion);
  return new Plane(normal, w);
};

Plane.fromPoints = function(ps) {
  var n = Polygon.calcNormal(ps);
  var p = ps[0];
  return Plane.fromPN(p, n);
};

Plane.distancePoint = function(plane, point) {
  return plane.distancePoint(point);
};

//Machine Equal
Plane.mequals = function(plane1, plane2, precision) {
  precision = precision || 1e-2;
  var dot = Math.abs(Math.abs(a.normal.dot(b.normal)) - 1) < precision;
  var wdelta = Math.abs(a.w - b.w) < precision;
  if (dot && w) return true;

  return false;
};
