
export async function init(canvas: HTMLCanvasElement) {
    //获取显卡适配器
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    });
    //获取设备
    const device = await adapter?.requestDevice()!;

    //获取gpu交互上下文
    const context = canvas.getContext("webgpu")!;
    // 交换链，用于显卡往显示器输出图像
    const swapChainFormat = "bgra8unorm";

    context.configure({
        device,
        format: swapChainFormat,
    });

    //测试三角形
    const vertexArray = new Float32Array([
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ]);

    const verticesBuffer = device.createBuffer({
        size: vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(verticesBuffer.getMappedRange()).set(vertexArray);
    verticesBuffer.unmap();

    //渲染管线
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: wgslShaders.vertex,
            }),
            entryPoint: "main",
            buffers: [
                {
                    /*
                    步进值，也就是每个顶点需要占用几个储存空间，单位是 byte。
                    我们是用 Float32Array 来储存顶点位置的，每个 32 位浮点数需要 4 个 byte；
                    xyz三维顶点需要 3 个 32 位浮点数来分别表示，即 4 * 3 byte。
                    xy二维顶点需要2个32 位浮点数来分别表示，即 4 * 2 个 byte。*/
                    arrayStride: 4 * 2,
                    attributes: [
                        {
                            // position
                            //对应顶点着色器中 (location = 0)
                            shaderLocation: 0,
                            //0代表从头开始，不设置位移，有时候可以将多个顶点写一个buffer,根据offset位移选择用于不同地方
                            offset: 0,
                            //2个32位浮点数,如果3个32位浮点数，就可以写float32x3
                            format: "float32x2",
                        }
                    ],
                },
            ]
        },
        fragment: {
            module: device.createShaderModule({
                code: wgslShaders.fragment,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: swapChainFormat,
                },
            ],
        },
        // 绘制模式
        /*
        enum GPUPrimitiveTopology {
          "point-list",
          "line-list",
          "line-strip",
          "triangle-list",
          "triangle-strip"
        };
    
        */
        primitive: {
            topology: 'triangle-list',
        }
    });

    function frame() {
        const commandEncoder = device.createCommandEncoder();
        // 获取当前纹理图像
        const textureView = context.getCurrentTexture().createView();
        // 渲染通道描述
        const renderPassDescriptor: any = {
            // 存储图像信息
            colorAttachments: [
                {
                    // 指定存储图像的位置
                    view: textureView,
                    // 背景颜色
                    loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    storeOp: 'store',
                    // storeOp 存储选型  store 或 clear,必需显示声明
                    // resolveTarget 多重采样
                },
            ],
        };

        //开启一个渲染通道
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        //默认会开启一个视口viewport，宽高就是canvas的width height而不是clientwidth,clientheight
        //设置 渲染管线
        passEncoder.setPipeline(pipeline);


        passEncoder.setVertexBuffer(0, verticesBuffer);

        passEncoder.draw(3, 1, 0, 0);
        (passEncoder as any).endPass();

        device.queue.submit([commandEncoder.finish()]);
    }
    frame()
    return frame;
}

export const wgslShaders = {
    vertex: `
  @stage(vertex) 
  fn main(@location(0)  a_position : vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(a_position, 0.0, 1.0);
  }`,
    fragment: `
  @stage(fragment) 
  fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
  }`,
};

init(document.getElementById('canvas')!);
