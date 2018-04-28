var textCount = 0;

function Tex(image) {
	this.id = textCount++;
	this.uuid = Cm.uuid();

	this.image = image;
	this.mipmaps = [];

	this.wrapS = wrapS || GL.CLAMP_TO_EDGE;
	this.wrapT = wrapT || GL.CLAMP_TO_EDGE;

	this.magFilter = magFilter || GL.LINEAR_MIPMAP_LINEAR;
	this.minFilter = minFilter || GL.LINEAR_MIPMAP_NEAREST;

	this.anisotropy = anisotropy || 1;

	this.format = format || GL.RGBA;
	this.type = type || GL.UNSIGNED_SHORT;

	this.offset = new Vec(0, 0);
	this.repeat = new Vec(1, 1);
	this.center = new Vec(0, 0);
	this.rotation = 0;

	this.flipY = true;
	this.generateMipmaps = true;
	this.version = 0;
}