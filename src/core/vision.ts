import { Xort } from './xort';
import { IBindGroupData } from './manager/bindGroupManager';

export interface IViewport {
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number,
}
export class MetaVision {
    isSupportWebGPU: boolean;
    private _canvas: HTMLCanvasElement;
    _options: any;
    adapter!: GPUAdapter;
    device!: GPUDevice;
    context!: GPUCanvasContext;
    _width: number;
    _height: number;
    _pixelRatio: number = 1;
    depthTexture: any;
    stencilTexture: any;

    _viewport: IViewport;

    // commadnEncoder!: GPUCommandEncoder;
    // renderPass!: GPURenderPassEncoder;
    constructor(private xort: Xort, canvas: HTMLCanvasElement, options: any) {
        this._options = options;
        this._canvas = canvas;
        this.isSupportWebGPU = typeof GPUAdapter !== undefined;

        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._viewport = { x: 0, y: 0, width: canvas.width, height: canvas.height, minDepth: 0, maxDepth: 1 };
    }

    async init() {
        const adapterOptions: GPURequestAdapterOptions = {
            powerPreference: 'high-performance'
        }

        const adapter = await navigator.gpu.requestAdapter(adapterOptions);
        if (adapter === null) {
            throw new Error('MetaVision: Unable to create WebGPU adapter.');
        }

        const deviceDescriptor: GPUDeviceDescriptor = {
        };

        const device = await adapter.requestDevice(deviceDescriptor);

        device.lost.then((info) => {
            console.error(`WebGPU device was lost: ${info.message}`);
        });

        const context = this._canvas.getContext('webgpu')!;
        // context.configure({ device, format: 'rgba8unorm' /* TODO */ });
        context.configure({
            device,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: 'opaque',//'premultiplied'  
        });

        this.adapter = adapter;
        this.device = device;
        this.context = context;


    }

    setViewport(x: number, y: number, width: number, height: number, minDepth = 0, maxDepth = 1) {

        this._viewport.x = x;
        this._viewport.y = y;
        this._viewport.width = width;
        this._viewport.height = height;
        this._viewport.minDepth = minDepth;
        this._viewport.maxDepth = maxDepth;
    }

    setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';


        this.context.configure({
            device: this.device,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: 'opaque',//'premultiplied'
            size: {
                width: this._width,
                height: this._height,
                depthOrArrayLayers: 1
            },
        });
        this.setViewport(0, 0, width, height);

        this.xort.scene.depthTexture = this.device.createTexture({
            size: [this._width, this._height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        })

    }

    render() {
        const pipelineManager = this.xort.renderpipelineManager;
        const bindGroupManager = this.xort.bindGroupManager;
        const commadnEncoder = this.device.createCommandEncoder()
        const scene = this.xort.scene;

        const vp = this._viewport;
        const width = vp.width
        const height = vp.height

        if (!scene.depthTexture)
            scene.depthTexture = this.device.createTexture({
                size: [width, height, 1],
                format: "depth24plus",
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            })

        const textureView = this.context.getCurrentTexture().createView();
        const depthView = scene.depthTexture.createView();
        const renderPass = commadnEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: [1, 1, 1, 1],
                loadOp: 'clear',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: depthView,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: "store",
                /*stencilClearValue: 0,
                stencilLoadOp: 'clear',
                stencilStoreOp: "store"*/
            }
        });

        renderPass.setViewport(vp.x, vp.y, width, height, vp.minDepth, vp.maxDepth);

        for (let i = 0, len = scene.opaque.length; i < len; i++) {
            const opaqueObject = scene.opaque[i];
            const pipeline: GPURenderPipeline = pipelineManager.acquire(opaqueObject);

            const geometry = opaqueObject.geometry?._asset!;
            const bindGroupData: IBindGroupData = bindGroupManager.acquire(opaqueObject, pipeline);

            renderPass.setPipeline(pipeline);

            for (const key in geometry.attributes) {
                const attribute = geometry.attributes[key];
                const gpuAttr: { buffer: GPUBuffer } = this.xort.geometricManager.get(attribute);
                renderPass.setVertexBuffer(attribute.location, gpuAttr.buffer);
            }
            if (geometry.index) {
                const bufferData = this.xort.geometricManager.get(geometry.index);
                renderPass.setIndexBuffer(bufferData.buffer, geometry.indexFormat);
            }

            renderPass.setBindGroup(0, bindGroupData.bindGroup);

            if (bindGroupData.transfrom)
                this.device.queue.writeBuffer(bindGroupData.transfrom, 0, new Float32Array(16 * 4 + 9 + 3).fill(0))
            if (geometry.index)
                renderPass.drawIndexed(geometry.index.count);
            else
                renderPass.draw(geometry.getAttribute('position').count);

        }

        renderPass.end();
        this.device.queue.submit([commadnEncoder.finish()]);
    }

    _renderObject() {

    }
}