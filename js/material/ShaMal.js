function ShaMal(args) {
	Mal.call(this);
	this.type = 'ShaMal';

	this.defines = {};
	//uniforms传入定义在Material中，attribute数据定义在BufferGeometry中
	this.uniforms = {};

	this.vertexShader = ['void main() {',
		'\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		' }'
	].join('\n');
	this.fragmentShader = ['void main() {',
		'\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',
		'}'
	].join('\n');;
	
	this.setValues(args)
}

ShaMal.prototype = Object.assign(Object.create(Mal.prototype), {
	constructor: ShaMal,
	isShaMal: true,
})