#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP ) //专门为light和ao准备

	attribute vec2 uv2;
	varying vec2 vUv2;

	uniform mat3 uv2Transform;

#endif