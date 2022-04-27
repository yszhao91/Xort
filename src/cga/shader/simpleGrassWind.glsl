
uniform float uTime;
uniform float windSpeed;
uniform float windIntensity;
uniform float windWeight;

mat4 rotationAxis(float angle,vec3 axis){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;
    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
    0.,0.,0.,1.);
}

vec3 rotateOnAxis(vec3 axis,float rotationAngle,vec3 pivotPoint,vec3 position){
    position=position-pivotPoint;
    mat4 rmy=rotationAxis(rotationAngle,axis);
    return(vec4(position,1.)*rmy).xyz+pivotPoint;
}

vec4 wind=vec4(0.,1.,0.,1.);
vec3 zvalue=vec3(0.,0.,1.);
vec3 dpoint=vec3(0.,0.,-10.);

vec3 simpleGrassWind(vec3 finalPosition,vec3 addtionalWPO,float intensity,float weight,float windSpeed){
    vec3 nwindrgb=normalize(wind.rgb);
    vec3 windrgb=cross(nwindrgb,zvalue);
    
    float speed=wind.a*uTime*windSpeed*-.5;
    vec3 windspeed=nwindrgb*speed;
    
    vec3 scalePosition=finalPosition/1024.;
    vec3 scalePosition1=speed+finalPosition/200.;
    
    vec3 swindSpeed=abs(fract(scalePosition1+.5)*2.-1.);
    
    float winddistance=distance(((3.-swindSpeed*2.)*swindSpeed)*swindSpeed,vec3(0.));
    
    vec3 windspeed2=windspeed+scalePosition;
    vec3 absSpeed=abs(fract(windspeed2+.5)*2.-1.);
    vec3 windspeed3=3.-absSpeed*2.;
    vec3 windspeed4=windspeed3*absSpeed*absSpeed;
    
    float windallDis=dot(nwindrgb,windspeed4)+winddistance;
    
    vec3 pivotPoint=addtionalWPO+dpoint;
    
    vec3 rotateVec3=rotateOnAxis(windrgb,windallDis,pivotPoint,addtionalWPO);
    rotateVec3=rotateVec3*weight*intensity;
    return addtionalWPO+rotateVec3;
}

vec2 panner(vec2 uv,vec2 speed,float time){
    return time*speed+uv;
}

vec3 WindLineMask(vec3 WPos,float windlineSize,vec2 speed,sampler2D noise,float wpoAmount){
    vec2 uv=(WPos/windlineSize).rg;
    uv=panner(uv,speed,uTime);
    vec3 rgb=texture2D(noise,uv)*wpoAmount;
    return rgb;
}

vec3 GrassStrandWPOMask(vec3 WPos,float windlineSize,sampler2D noise,vec2 uv,float wpoAmount,float intensity,float weight,float windSpeed){
    //WindLineMask start
    vec2 uv=(WPos/windlineSize).rg;
    uv=panner(uv,speed,uTime);
    vec3 addtionalWPO=texture2D(noise,uv)*wpoAmount;
    //WindLineMask end
    
    vec3 sgwPos=simpleGrassWind(WPos,addtionalWPO,intensity,weight,windSpeed);
    
    float alpha=clamp((1.-uv.v)*grassWindGradient,0.,1.);
    vec3 vertexOffset=mix(WSNomral,sgwPos,alpha);
    
    return vertexOffset;
}

