const INFO = "__WEBGPU_LIVE_SHADER_INFO__";

import { OnShaderRegisteredCallback } from './client';

type GPUDeviceInfo = {
    onShaderRegisteredCallback?: OnShaderRegisteredCallback;
}

type GPUShaderModuleInfo = {
    device: GPUDevice,
    descriptor: GPUShaderModuleDescriptor,
    id: string,
    replacement?: GPUShaderModule,
    generation: number,
}

type GPUPipelineInfo = {
    device: GPUDevice,
    descriptor: GPURenderPipelineDescriptor | GPUComputePipelineDescriptor,
    replacement?: GPURenderPipeline | GPUComputePipeline,
    registrationGeneration: number,
    vertexStageGeneration: number,
    fragmentStageGeneration: number,
    computeStageGeneration: number,
}

interface GPUDeviceWithInfo extends GPUDevice {
    [INFO]: GPUDeviceInfo
}

interface GPUShaderModuleWithInfo extends GPUShaderModule {
    [INFO]: GPUShaderModuleInfo
}

interface GPURenderPipelineWithInfo extends GPURenderPipeline {
    [INFO]: GPUPipelineInfo
}

interface GPUComputePipelineWithInfo extends GPUComputePipeline {
    [INFO]: GPUPipelineInfo
}

const randomId = () => Math.random().toString(36).substring(2, 15);

export function initializeDeviceInfo(obj: GPUDevice): GPUDeviceInfo {
    if (INFO in obj) {
        return (obj as GPUDeviceWithInfo)[INFO];
    }
    const info: GPUDeviceInfo = {};
    (obj as GPUDeviceWithInfo)[INFO] = info;
    return info;
}

export function initializeShaderModuleInfo(device: GPUDevice, descriptor: GPUShaderModuleDescriptor, obj: GPUShaderModule): GPUShaderModuleInfo {
    if (INFO in obj) {
        return (obj as GPUShaderModuleWithInfo)[INFO];
    }
    const info: GPUShaderModuleInfo = {
        device,
        descriptor,
        id: randomId(),
        generation: 0,
    };
    (obj as GPUShaderModuleWithInfo)[INFO] = info;
    return info;
}

export function initializeRenderPipelineInfo(device: GPUDevice, descriptor: GPURenderPipelineDescriptor, obj: GPURenderPipeline): GPUPipelineInfo {
    if (INFO in obj) {
        return (obj as GPURenderPipelineWithInfo)[INFO];
    }
    const info: GPUPipelineInfo = {
        device,
        descriptor,
        registrationGeneration: 0,
        vertexStageGeneration: 0,
        fragmentStageGeneration: 0,
        computeStageGeneration: 0,
    };
    (obj as GPURenderPipelineWithInfo)[INFO] = info;
    return info;
}

export function initializeComputePipelineInfo(device: GPUDevice, descriptor: GPUComputePipelineDescriptor, obj: GPUComputePipeline): GPUPipelineInfo {
    if (INFO in obj) {
        return (obj as GPUComputePipelineWithInfo)[INFO];
    }
    const info: GPUPipelineInfo = {
        device,
        descriptor,
        registrationGeneration: 0,
        vertexStageGeneration: 0,
        fragmentStageGeneration: 0,
        computeStageGeneration: 0,
    };
    (obj as GPUComputePipelineWithInfo)[INFO] = info;
    return info;
}

export function getDeviceInfo(obj: GPUDevice | GPUDeviceWithInfo): GPUDeviceInfo | undefined {
    return INFO in obj ? (obj as GPUDeviceWithInfo)[INFO] : undefined;
}

export function getShaderModuleInfo(obj: GPUShaderModule): GPUShaderModuleInfo {
    return (obj as GPUShaderModuleWithInfo)[INFO];
}

export function getPipelineInfo(obj: GPURenderPipeline | GPUComputePipeline) {
    return (obj as GPURenderPipelineWithInfo | GPUComputePipelineWithInfo)[INFO];
}
