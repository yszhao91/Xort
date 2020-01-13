function LineMal( args ) {
	Mal.call( this );

	this.type = 'LineMal';

	this.color = new Color( 0xffffff );

	this.linewidth = 1;
	this.linecap = 'round';
	this.linejoin = 'round';

	this.lights = false;

	this.setValues( args );

}


LineMal.prototype = Object.assign(Object.create(Mal.prototype), {
	constructor: LineMal,
	isRawShaMal: true,
})