function ShaMal(args) {
	Mal.call(this);
	this.type = 'ShaMal';

	this.defines = {};
	//uniforms传入定义在Material中，attribute数据定义在BufferGeometry中
	this.uniforms = {};

	this.vsSource = args.vsSource || ['void main() {',
		'\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		' }'
	].join('\n');
	this.fsSource = args.fsSource || ['void main() {',
		'\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',
		'}'
	].join('\n');;

	this.setValues(args)
}

ShaMal.prototype = Object.assign(Object.create(Mal.prototype), {
	constructor: ShaMal,
	isShaMal: true,
})