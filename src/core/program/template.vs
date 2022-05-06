uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

#ifdef USE_INSTANCING
    attribute mat4 instanceMatrix;
#endif

#ifdef USE_INSTANCING_COLOR
    attribute vec3 instanceColor;
#endif

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

#ifdef USE_TANGENT
    attribute vec4 tangent;
#endif

#if defined(USE_COLOR_ALPHA)

    attribute vec4 color;

#elif defined(USE_COLOR)

    attribute vec3 color;

#endif

#ifdef USE_MORPHTARGETS

    attribute vec3 morphTarget0;
    attribute vec3 morphTarget1;
    attribute vec3 morphTarget2;
    attribute vec3 morphTarget3;

    #ifdef USE_MORPHNORMALS

        attribute vec3 morphNormal0;
        attribute vec3 morphNormal1;
        attribute vec3 morphNormal2;
        attribute vec3 morphNormal3;

    #else

        attribute vec3 morphTarget4;
        attribute vec3 morphTarget5;
        attribute vec3 morphTarget6;
        attribute vec3 morphTarget7;

    #endif

#endif

#ifdef USE_SKINNING

    attribute vec4 skinIndex;
    attribute vec4 skinWeight;

#endif
