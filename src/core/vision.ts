import { EventHandler } from '../cga/render/eventhandler';
import { XortScene } from './scene';
import { Xort } from './xort';

export interface IViewport {
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number,
}
export class MetaVision extends EventHandler {
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

    commadnEncoder!: GPUCommandEncoder;
    renderPass!: GPURenderPassEncoder;
    constructor(private xort: Xort, canvas: HTMLCanvasElement, options: any) {
        super();
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

        const context = this._canvas.getContext('webgpu')!;
        context.configure({ device, format: 'rgba8unorm' /* TODO */ });

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
        this.context.configure({
            device: this.device,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            compositingAlphaMode: 'premultiplied',
            size: {
                width: Math.floor(this._width * this._pixelRatio),
                height: Math.floor(this._height * this._pixelRatio),
                depthOrArrayLayers: 1
            },
        });

    }

    render() {
        this.commadnEncoder = this.device.createCommandEncoder()
        const scene = this.xort.scene;
        const textureView = this.context.getCurrentTexture().createView();
        this.renderPass = this.commadnEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: scene.background.array,
                loadOp: 'clear',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: scene.depthTexture,
                depthClearValue: 1.0,
            }
        });

        const vp = this._viewport;
        const width = vp.width * this._pixelRatio;
        const height = vp.height * this._pixelRatio;
        this.renderPass.setViewport(vp.x, vp.y, width, height, vp.minDepth, vp.maxDepth);
        //TODO
        this.renderPass.end();
        this.device.queue.submit([this.commadnEncoder.finish()]);
    }

    renderObject(pipeline: GPURenderPipeline, group: GPUBindGroup) {
        this.renderPass.setPipeline(pipeline)
        this.renderPass.setBindGroup(0, group); 

        this.device.queue.submit([this.commadnEncoder.finish()]);
    }

    private _setupIndex(buffer: any, renderPass: GPURenderPassEncoder) {
        const indexFormat: GPUIndexFormat = (buffer instanceof Uint16Array) ? 'uint16' : 'uint32';
        renderPass.setIndexBuffer(buffer, indexFormat);
    }

    private _setupVertex(renderPass: GPURenderPassEncoder, renderPipeline: GPURenderPipeline) {
        const shaderAttributes = renderPipeline;


    }
}