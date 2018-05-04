//Points
function Pts(geo, mal) {

	Obj3D.call(this);

	this.type = 'Pts';

	this.geo = geo !== undefined ? geo : new Buffergeo();
	this.mal = mal !== undefined ? mal : new Ptsmal({
		color: Math.random() * 0xffffff
	});

}

Pts.prototype = Object.assign(Object.create(Obj3D.prototype), {

	constructor: Pts,

	isPts: true,

});