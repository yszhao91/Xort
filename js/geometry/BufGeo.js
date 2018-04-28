//BufferGeometry

function BufGeo() {
  this.uuid = Cm.uuid();

  this.name = "";
  this.type = "BufGeometry";

  this.index = null;
  this.attr = {};

  //包围盒boudingBox
  this.bbox = null;
  //包围盒boudingSphere
  this.bsphere = null;

  this.drawRange = { start: 0, count: Infinity };
}

BufGeo.prototype = Object.assign({
  constructor: BufGeo,
  isBufGeo: true,

  addAttr: function(name, attr) {
    if (name === "index") this.index = index;
    else this.attr[name] = attr;

    return this;
  },

  getAttr: function(name) {
    return this.attr[name];
  },

  removeAttr: function(name) {
    delete this.attr[name];
  }
});
