#ifdef USE_UV

    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

#endif

#if defined(USE_UV2) //defined( USE_LIGHTMAP ) || defined( USE_AOMAP )

    vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;

#endif



