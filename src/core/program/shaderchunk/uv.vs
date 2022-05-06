#ifdef USE_UV 

    #ifdef UVS_VERTEX_ONLY //fragment不需要的话
        vec2 vUv; 
    #else 
        varying vec2 vUv; 
    #endif

    uniform mat3 uvTransform; 

#endif

#if defined( USE_UV2 )//defined( USE_LIGHTMAP ) || defined( USE_AOMAP ) ||

    attribute vec2 uv2;
    varying vec2 vUv2;

    uniform mat3 uv2Transform;

#endif 