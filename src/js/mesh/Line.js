//Line 画线
function Line(geo, mal) {

	Obj3D.call(this);

	this.type = 'Lines';
	this.

	this.geo = geo !== undefined ? geo : new BufferGeo();
	this.mal = mal !== undefined ? mal : new LineMal({
		color: Math.random() * 0xffffff
	});

}

Lines.prototype = Object.assign(Object.create(Obj3D.prototype), {

	constructor: Lines,

	isPts: true,

});