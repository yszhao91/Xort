//Points Material 
//主要用于粒子系统
function PtsMal(args) {
	Mal.call(this,args)
	this.type = 'PtsMal';
}

PtsMal.prototype = Object.assign(Object.create(Mal.prototype), {
	constructor: PtsMal,
	isRawShaMal: true,
})