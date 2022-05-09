import { EventHandler } from '../cga/render/eventhandler';
import { GPUTextureFormat } from './webgpu';
import { XortScene } from './scene';

export class MetaVision extends EventHandler {
    isSupportWebGPU: boolean;
    private _canvas: HTMLCanvasElement;
    _options: any;
    adapter!: GPUAdapter;
    device!: GPUDevice;
    gpucontext!: GPUCanvasContext;
    _width: number;
    _height: number;
    _pixelRatio: number = 1;
    constructor(canvas: HTMLCanvasElement, options: any) {
        super();
        this._options = options;
        this._canvas = canvas;
        this.isSupportWebGPU = typeof GPUAdapter !== undefined;

        this._width = this._canvas.width;
        this._height = this._canvas.height;
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

        this.adapter = adapter;
        this.device = device;
        this.gpucontext = context;

    }

    setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.gpucontext.configure({
            device: this.device,
            format: GPUTextureFormat.BGRA8Unorm as any,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            compositingAlphaMode: 'premultiplied',
            size: {
                width: Math.floor(this._width * this._pixelRatio),
                height: Math.floor(this._height * this._pixelRatio),
                depthOrArrayLayers: 1
            },
        });

    } 

    render(scene: XortScene) {
        
    }
}