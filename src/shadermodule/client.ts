import cloneDeep from 'clone-deep';
import { initializeDeviceInfo, initializeShaderModuleInfo, initializeRenderPipelineInfo, initializeComputePipelineInfo, getDeviceInfo, getPipelineInfo, getShaderModuleInfo } from './objectInfo';

function clone<T>(obj: T) {
    return cloneDeep(obj) as T;
}

type ClientFunctions = {
    createShaderModule: GPUDevice["createShaderModule"],
    createRenderPipeline: GPUDevice["createRenderPipeline"],
    createRenderPipelineAsync: GPUDevice["createRenderPipelineAsync"],
    createComputePipeline: GPUDevice["createComputePipeline"],
    createComputePipelineAsync: GPUDevice["createComputePipelineAsync"],
    setRenderPipeline: GPURenderPassEncoder["setPipeline"],
    setComputePipeline: GPUComputePassEncoder["setPipeline"]
}

export type OnShaderRegisteredCallback = (source: any, updateCallback: (updatedSource: any) => void) => void;

class Client {
    _fn: ClientFunctions;
    _registrationGeneration: number = 1;
    _shaderModuleUpdates: Map<string, any> = new Map();

    constructor(fn: ClientFunctions) {
        this._fn = fn;
    }

    setOnShaderRegisteredCallback(device: GPUDevice, callback?: OnShaderRegisteredCallback) {
        initializeDeviceInfo(device).onShaderRegisteredCallback = callback;
    }

    createShaderModule(device: GPUDevice, descriptor: GPUShaderModuleDescriptor): GPUShaderModule {
        descriptor = clone(descriptor)!;

        const shaderModule = this._fn.createShaderModule.call(device, descriptor);
        initializeShaderModuleInfo(device, descriptor, shaderModule);

        return shaderModule;
    }

    createRenderPipeline(device: GPUDevice, descriptor: GPURenderPipelineDescriptor): GPURenderPipeline {
        descriptor = clone(descriptor)!;

        const pipeline = this._fn.createRenderPipeline.call(device, descriptor);
        initializeRenderPipelineInfo(device, descriptor, pipeline);

        return pipeline;
    }

    async createRenderPipelineAsync(device: GPUDevice, descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline> {
        descriptor = clone(descriptor)!;

        const pipeline = await this._fn.createRenderPipelineAsync.call(device, descriptor);
        initializeRenderPipelineInfo(device, descriptor, pipeline);

        return pipeline;
    }

    createComputePipeline(device: GPUDevice, descriptor: GPUComputePipelineDescriptor): GPUComputePipeline {
        descriptor = clone(descriptor)!;

        const pipeline = this._fn.createComputePipeline.call(device, descriptor);
        initializeComputePipelineInfo(device, descriptor, pipeline);

        return pipeline;
    }

    async createComputePipelineAsync(device: GPUDevice, descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline> {
        descriptor = clone(descriptor)!;

        const pipeline = await this._fn.createComputePipelineAsync.call(device, descriptor);
        initializeComputePipelineInfo(device, descriptor, pipeline);

        return pipeline;
    }

    private registerShaderStage(shaderStage?: /* GPUProgrammableStageDescriptor */ any) {
        if (!shaderStage || !shaderStage.module) {
            return;
        }

        const shaderModule = shaderStage.module;
        const info = getShaderModuleInfo(shaderModule);

        const callback = getDeviceInfo(info.device)?.onShaderRegisteredCallback;
        if (callback !== undefined) {
            callback(info.descriptor.code, (updatedSource: any) => {
                this._shaderModuleUpdates.set(info.id, updatedSource);
            });
        }
    }

    private registerRenderPipelineShaders(pipeline: GPURenderPipeline) {
        const info = getPipelineInfo(pipeline);
        if (info.registrationGeneration === this._registrationGeneration) {
            return;
        }
        info.registrationGeneration = this._registrationGeneration;

        const descriptor = info.descriptor as /* GPURenderPipelineDescriptorNew | GPURenderPipelineDescriptorOld */any;
        this.registerShaderStage('vertex' in descriptor ? descriptor.vertex : descriptor.vertexStage);
        this.registerShaderStage('fragment' in descriptor ? descriptor.fragment : 'fragmentStage' in descriptor ? descriptor.fragmentStage : undefined);
    }

    private registerComputePipelineShaders(pipeline: GPUComputePipeline) {
        const info = getPipelineInfo(pipeline);
        if (info.registrationGeneration === this._registrationGeneration) {
            return;
        }
        info.registrationGeneration = this._registrationGeneration;

        const descriptor = info.descriptor as GPUComputePipelineDescriptor;
        this.registerShaderStage('compute' in descriptor ? descriptor.compute : descriptor.computeStage);
    }

    private updateShaderStage(shaderStage?: GPUProgrammableStage): number | undefined {
        if (!shaderStage || !shaderStage.module) {
            return undefined;
        }

        const shaderModule = shaderStage.module;
        const info = getShaderModuleInfo(shaderModule);

        if (this._shaderModuleUpdates.has(info.id)) {
            const shaderSource = this._shaderModuleUpdates.get(info.id);
            info.descriptor.code = shaderSource;

            this._shaderModuleUpdates.delete(info.id);

            try {
                const replacement = this._fn.createShaderModule.call(info.device, info.descriptor);
                initializeShaderModuleInfo(info.device, info.descriptor, replacement);
                Object.assign(getShaderModuleInfo(replacement), info);

                info.replacement = replacement;
                info.generation += 1;
            } catch (e) {
                console.error(e);
            }
        }

        return info.generation;
    }

    private updatePipeline(pipeline: GPURenderPipeline | GPUComputePipeline) {
        if (this._shaderModuleUpdates.size === 0) {
            return;
        }

        const info: any = getPipelineInfo(pipeline);
        const descriptor = info.descriptor;

        let vertexStageGeneration = undefined;
        let fragmentStageGeneration = undefined;
        let computeStageGeneration = undefined;

        let vertex: GPUProgrammableStage | undefined;
        let fragment: GPUProgrammableStage | undefined;
        let compute: GPUProgrammableStage | undefined;
        let vertexStage: GPUProgrammableStage | undefined;
        let fragmentStage: GPUProgrammableStage | undefined;
        let computeStage: GPUProgrammableStage | undefined;

        if ('vertex' in descriptor) {
            vertex = descriptor.vertex;
        } else if ('vertexStage' in descriptor) {
            vertexStage = descriptor.vertexStage;
        }
        if ('fragment' in descriptor) {
            fragment = descriptor.fragment;
        } else if ('fragmentStage' in descriptor) {
            fragmentStage = descriptor.fragmentStage;
        }
        if ('compute' in descriptor) {
            compute = descriptor.compute;
        } else if ('computeStage' in descriptor) {
            computeStage = descriptor.computeStage;
        }

        vertexStageGeneration = this.updateShaderStage(vertex) || this.updateShaderStage(vertexStage);
        fragmentStageGeneration = this.updateShaderStage(fragment) || this.updateShaderStage(fragmentStage);
        computeStageGeneration = this.updateShaderStage(compute) || this.updateShaderStage(computeStage);

        const vertexStageUpdated = (vertexStageGeneration !== undefined && vertexStageGeneration !== info.vertexStageGeneration);
        const fragmentStageUpdated = (fragmentStageGeneration !== undefined && fragmentStageGeneration !== info.fragmentStageGeneration);
        const computeStageUpdated = (computeStageGeneration !== undefined && computeStageGeneration !== info.computeStageGeneration);

        if (!(vertexStageUpdated || fragmentStageUpdated || computeStageUpdated)) {
            return;
        }

        if (vertexStageUpdated) {
            // @ts-ignore
            if (vertex) descriptor.vertex.module = getShaderModuleInfo(descriptor.vertex.module).replacement;

            // @ts-ignore
            if (vertexStage) descriptor.vertexStage.module = getShaderModuleInfo(descriptor.vertexStage.module).replacement;
        }

        if (fragmentStageUpdated) {
            // @ts-ignore
            if (fragment) descriptor.fragment.module = getShaderModuleInfo(descriptor.fragment.module).replacement;

            // @ts-ignore
            if (fragmentStage) descriptor.fragmentStage.module = getShaderModuleInfo(descriptor.fragmentStage.module).replacement;
        }

        if (computeStageUpdated) {
            // @ts-ignore
            if (compute) descriptor.compute.module = getShaderModuleInfo(descriptor.compute.module).replacement;

            // @ts-ignore
            if (computeStage) descriptor.computeStage.module = getShaderModuleInfo(descriptor.computeStage.module).replacement;
        }

        if (vertexStageUpdated || fragmentStageUpdated) {
            this._fn.createRenderPipelineAsync.call(info.device, descriptor as GPURenderPipelineDescriptor).then(pipeline => {
                info.replacement = pipeline;
            });
        } else if (computeStageUpdated) {
            this._fn.createComputePipelineAsync.call(info.device, descriptor as GPUComputePipelineDescriptor).then(pipeline => {
                info.replacement = pipeline;
            });
        }
    }

    setRenderPipeline(encoder: GPURenderPassEncoder, pipeline: GPURenderPipeline): void {
        this.registerRenderPipelineShaders(pipeline);
        this.updatePipeline(pipeline);
        pipeline = getPipelineInfo(pipeline).replacement as GPURenderPipeline || pipeline;
        return this._fn.setRenderPipeline.call(encoder, pipeline);
    }

    setComputePipeline(encoder: GPUComputePassEncoder, pipeline: GPUComputePipeline): void {
        this.registerComputePipelineShaders(pipeline);
        this.updatePipeline(pipeline);
        pipeline = getPipelineInfo(pipeline).replacement as GPUComputePipeline || pipeline;
        return this._fn.setComputePipeline.call(encoder, pipeline);
    }
};

export const client = navigator.gpu ? new Client({
    createShaderModule: GPUDevice.prototype.createShaderModule,
    createRenderPipeline: GPUDevice.prototype.createRenderPipeline,
    createRenderPipelineAsync: GPUDevice.prototype.createRenderPipelineAsync,
    createComputePipeline: GPUDevice.prototype.createComputePipeline,
    createComputePipelineAsync: GPUDevice.prototype.createComputePipelineAsync,
    setRenderPipeline: GPURenderPassEncoder.prototype.setPipeline,
    setComputePipeline: GPUComputePassEncoder.prototype.setPipeline,
}) : undefined!;
