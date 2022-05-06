struct IncidentLight{
    vec3 color;
    vec3 direction;
    bool visible;
}

struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

struct GeometricContext {
    vec3 position;
    vec3 normal;
    vec3 viewDir;
    #ifdef CLEARCOAT
        vec3 clearcoatNormal;
    #endif
};


bool isPerspectiveMatrix( mat4 m ) { 
	return m[ 2 ][ 3 ] == - 1.0; 
}
