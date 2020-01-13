function RawShaMal(args) {
	ShaMal.call(this,args)
	this.type = 'RawShaMal';
}

RawShaMal.prototype = Object.assign(Object.create(Mal.prototype), {
	constructor: RawShaMal,
	isRawShaMal: true,
	
})