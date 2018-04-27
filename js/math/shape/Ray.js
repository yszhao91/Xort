function Ray(origin, dir) {
	this.origin = origin;
	this.dir = dir.normalize();
}

Ray.distanceToPoint = function(ray, point) {
	var v1 = new THREE.Vector3();

	return function distanceSqToPoint(point) {

		var dot = v1.subVectors(point, ray.origin).dot(ray.direction);

		// 和射线方向相反,在射线上的投影長度
		if(dot < 0)
			return ray.origin.distanceTo(point);

		v1.copy(ray.direction).multiplyScalar(dot).add(ray.origin);

		return v1.distanceTo(point);

	};
}();

Ray.distanceSegment = function(ray, seg) {
	
}