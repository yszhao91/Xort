import { v3, m4, PerspectiveCamera } from "xtorcga"
// import glslang from "./glslang"
let glslang;
export async function glslangX() {
    if (glslang !== undefined) return glslang;
    // @ts-ignore
    const glslangModule = await import(/* webpackIgnore: true */ 'https://unpkg.com/@webgpu/glslang@0.0.7/web/glslang.js');
    glslang = await glslangModule.default();
    return glslang;
}
// var glslang = glslangX();
async function init() {
    const vertexShaderGLSL = `#version 450
  layout(set = 0, binding = 0) uniform Uniforms {
    mat4 modelViewProjectionMatrix;
  } uniforms;

  layout(location = 0) in vec4 position;
  layout(location = 1) in vec4 color;

  layout(location = 0) out vec4 fragColor;

  void main() {
    gl_Position = uniforms.modelViewProjectionMatrix * position;
    fragColor = color;
  }`;

    const glslangx = await glslangX();
    var code = glslangx.compileGLSL(vertexShaderGLSL, "vertex")
    debugger

}

init()


const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.append(canvas);
const gpu = canvas.getContext("gpupresent")
if (gpu)
    console.info(`Congratulations! You've got a WebGPU context!`);
else
    throw new Error('Your browser seems not support WebGPU!');

const triangleVertex = new Float32Array([

    0.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0

]);

const triangleIndex = new Uint32Array([0, 1, 2]);

const triangleMVMatrix = m4().makeTranslation(-1.5, 0.0, -7.0);

const squareVertex = new Float32Array([

    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0

]);

const squareIndex = new Uint32Array([0, 1, 2, 1, 2, 3]);

const squareMVMatrix = m4().makeTranslation(1.5, 0.0, -7.0);
async function InitGPU() {
    this.adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    });


}

let main = async () => {
    let camera = new PerspectiveCamera(45, document.body.clientWidth / document.body.clientHeight, 0.1, 1000);
    let pMatrix = camera.projectionMatrix;

    let triangleUniformBufferView = new Float32Array(pMatrix.toArray().concat(triangleMVMatrix.toArray()));

    let squareUniformBufferView = new Float32Array(pMatrix.toArray().concat(squareMVMatrix.toArray()));

    let backgroundColor = { r: 0, g: 0, b: 0, a: 1.0 };



    await app.InitWebGPU();

    app.InitRenderPass(backgroundColor);

    app.InitPipeline(vxCode, fxCode);

    app.InitGPUBuffer(triangleVertex, triangleIndex, triangleUniformBufferView);

    app.Draw(triangleIndex.length);

    app.InitGPUBuffer(squareVertex, squareIndex, squareUniformBufferView);

    app.Draw(squareIndex.length);

    app.Present();

}
