import { Capabilites } from './capabilities';
import { ProgramManager } from './manager/programmanager';
import { EventHandler } from '../cga/render/eventhandler';
import { GPUTextureFormat } from './webgpu';

export class MetaVision extends EventHandler {
    isSupportWebGL2: boolean;
    isSupportWebGPU: boolean;
    private _canvas: HTMLCanvasElement;
    glContext!: WebGL2RenderingContext;
    usewebgl2: boolean = false;
    _programManager: ProgramManager
    _capitalits: Capabilites;
    private _options: any;
    _adapter: GPUAdapter;
    _device: GPUDevice;
    _context: GPUCanvasContext;
    constructor(canvas: HTMLCanvasElement, options: any) {
        super();
        this._options = options;
        this._canvas = canvas;
        this.isSupportWebGL2 = typeof WebGL2RenderingContext !== "undefined";
        this.isSupportWebGPU = typeof GPUAdapter !== undefined;

        if (this.isSupportWebGL2) {
            this.glContext = canvas.getContext('webgl2')!;
            this.usewebgl2 = true
        }

        this._capitalits = new Capabilites(this.glContext);
        this._programManager = new ProgramManager(this);
    }

    async init() {

        const adapterOptions = {

        }

        const adapter = await navigator.gpu.requestAdapter(adapterOptions);
        if (adapter === null) {
            throw new Error('MetaVision: Unable to create WebGPU adapter.');
        }

        const deviceDescriptor = {
        };

        const device = await adapter.requestDevice(deviceDescriptor);

        const context = this._canvas.getContext('webgpu')!;

        context.configure({
            device: device,
            format: 'bgra8unorm',  
            compositingAlphaMode: 'premultiplied'
        });

        this._adapter = adapter;
        this._device = device;
        this._context = context;

    }

    render() {
        
    }
}