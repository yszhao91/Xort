//提前申明 
function Vec3(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

function Mat3() {
	this.es = [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

function Mat4() {
	this.es = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

function Quat(x, y, z, w) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._w = (w !== undefined) ? w : 1;

}