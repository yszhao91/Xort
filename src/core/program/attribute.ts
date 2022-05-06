import { BufferAttribute, BufferGeometry } from "../../cga";
import { IStringDictionary } from "../../of";
import { GL } from "../GL";
import { GLProgram } from './program';

export interface IBindingState {
    // for backward compatibility on non-VAO support browser
    geometry: any,
    program: any,
    wireframe: boolean,

    newAttributes: any,
    enabledAttributes: any,
    attributeDivisors: any,
    object: WebGLVertexArrayObject,
    attributes: IStringDictionary<BufferAttribute>,
    index: BufferAttribute | any

}

export interface IAttrBuffer {
    version: any; //版本
    bytesPerElement: number;//buffer字节长度
    type: number;
    buffer: WebGLBuffer | null;

}

/**
 * Attribute管理器
 */
export class GLAttributeManager {
    isWebGL2: boolean = true;
    buffers: WeakMap<any, any> = new WeakMap();
    constructor(private gl: WebGL2RenderingContext) {

    }

    createBuffer(attribute: BufferAttribute, bufferType: number): IAttrBuffer {
        const gl = this.gl;

        const array = attribute.array;
        const usage = (attribute as any).usage;
        const buffer = gl.createBuffer();

        gl.bindBuffer(bufferType, buffer);
        gl.bufferData(bufferType, array, usage);

        if (attribute.onUploadCallback)
            attribute.onUploadCallback();

        let type = gl.FLOAT;

        if (array instanceof Float32Array) {

            type = gl.FLOAT;

        } else if (array instanceof Float64Array) {

            console.warn('THREE.WebGLAttributes: Unsupported data buffer format: Float64Array.');

        } else if (array instanceof Uint16Array) {
            if ((attribute as any).isFloat16BufferAttribute) {
                if (this.isWebGL2) {
                    type = gl.HALF_FLOAT;
                } else {
                    console.warn('THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.');
                }
            } else {
                type = gl.UNSIGNED_SHORT;
            }

        } else if (array instanceof Int16Array) {
            type = gl.SHORT;
        } else if (array instanceof Uint32Array) {

            type = gl.UNSIGNED_INT;

        } else if (array instanceof Int32Array) {

            type = gl.INT;

        } else if (array instanceof Int8Array) {

            type = gl.BYTE;

        } else if (array instanceof Uint8Array) {

            type = gl.UNSIGNED_BYTE;

        } else if (array instanceof Uint8ClampedArray) {
            type = gl.UNSIGNED_BYTE;
        }
        return {
            buffer: buffer,
            type: type,
            bytesPerElement: array.BYTES_PER_ELEMENT,
            version: attribute.version
        };

    }

    updateBuffer(buffer: any, attribute: BufferAttribute, bufferType: any) {
        const gl = this.gl;

        const array = attribute.array;
        const updateRange = attribute.updateRange;

        gl.bindBuffer(bufferType, buffer);

        if (updateRange.count === - 1) {
            // Not using update ranges 
            gl.bufferSubData(bufferType, 0, array);
        } else {
            if (this.isWebGL2) {
                gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
                    array, updateRange.offset, updateRange.count);
            } else {
                gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
                    array.subarray(updateRange.offset, updateRange.offset + updateRange.count));
            }
            updateRange.count = - 1; // reset range
        }

    }

    //

    get(attribute: BufferAttribute) {

        if ((attribute as any).isInterleavedBufferAttribute) attribute = (attribute as any).data;

        return this.buffers.get(attribute);

    }

    remove(attribute: BufferAttribute) {
        if ((attribute as any).isInterleavedBufferAttribute) attribute = (attribute as any).data;

        const data = this.buffers.get(attribute);

        if (data) {
            this.gl.deleteBuffer(data.buffer);

            this.buffers.delete(attribute);
        }

    }

    update(attribute: BufferAttribute | any, bufferType: number) {
        if (attribute.isDirectBufferAttribute) {
            const cached = this.buffers.get(attribute);
            if (!cached || cached.version < attribute.version) {
                this.buffers.set(attribute, {
                    buffer: attribute.buffer,
                    type: attribute.type,
                    bytesPerElement: attribute.elementSize,
                    version: attribute.version
                });

            }

            return;

        }

        if (attribute.isInterleavedBufferAttribute) attribute = attribute.data;

        const data = this.buffers.get(attribute);

        if (data === undefined) {

            this.buffers.set(attribute, this.createBuffer(attribute, bufferType));

        } else if (data.version < attribute.version) {

            this.updateBuffer(data.buffer, attribute, bufferType);

            data.version = attribute.version;

        }

    }
}

/**
 * Attribute 绑定管理
 */
export class GLAttributesState {
    maxVertexAttributes: number;
    vaoAvailable: boolean = true; //extensions.get( 'OES_vertex_array_object')!==null||isWebGL2===true
    currentState: IBindingState | any;
    bindingStates: IBindingState;
    attributes: GLAttributeManager;

    constructor(private gl: WebGL2RenderingContext) {
        this.maxVertexAttributes = gl.getParameter(GL.MAX_VERTEX_ATTRIBS);
        this.currentState = {} as any;
        this.bindingStates = {} as any;
        this.attributes = new GLAttributeManager(gl);
    }


    setup(entity: ModelEntity, geometry: BufferGeometry, material: Material, program: GLProgram, index: BufferAttribute | undefined) {
        const gl = this.gl

        let updateBuffers = false;

        if (this.vaoAvailable) {
            const state: IBindingState = this.getBindingState(geometry, program, material);

            if (this.currentState !== state) {
                this.currentState = state;
                this.gl.bindVertexArray(this.currentState.object)
            }

            updateBuffers = this.needsUpdate(geometry, index);
            if (updateBuffers) this.saveCache(geometry, index!);

        } else {

            const wireframe = (material.wireframe === true);

            if (this.currentState.geometry !== geometry.id ||
                this.currentState.program !== program.id ||
                this.currentState.wireframe !== wireframe) {

                this.currentState.geometry = geometry.id;
                this.currentState.program = program.id;
                this.currentState.wireframe = wireframe;

                updateBuffers = true;

            }

        }

        if ((entity as any).isInstancedMesh === true) {

            updateBuffers = true;

        }

        if (index) {

            this.attributes.update(index, gl.ELEMENT_ARRAY_BUFFER);

        }

        if (updateBuffers) {

            this.setupVertexAttributes(entity, material, program, geometry);

            if (index) {

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.attributes.get(index).buffer);

            }

        }

    }

    enableAttribute(attribute: number) {
        this.enableAttributeAndDivisor(attribute, 0);
    }

    enableAttributeAndDivisor(attribute: number, meshPerAttribute: number) {

        const newAttributes = this.currentState.newAttributes;
        const enabledAttributes = this.currentState.enabledAttributes;
        const attributeDivisors = this.currentState.attributeDivisors;

        newAttributes[attribute] = 1;

        if (enabledAttributes[attribute] === 0) {

            this.gl.enableVertexAttribArray(attribute);
            enabledAttributes[attribute] = 1;

        }

        if (attributeDivisors[attribute] !== meshPerAttribute) {

            this.gl.vertexAttribDivisor(attribute, meshPerAttribute);
            attributeDivisors[attribute] = meshPerAttribute;

        }

    }


    setupVertexAttributes(object: ModelEntity | any, material: Material | any, program: GLProgram, geometry: BufferGeometry | any) {

        const newAttributes = this.currentState.newAttributes;
        for (let i = 0, il = newAttributes.length; i < il; i++) {
            newAttributes[i] = 0;
        }

        const geometryAttributes = geometry.attributes;

        const programAttributes = program.getAttributes();

        const materialDefaultAttributeValues = material.defaultAttributeValues;

        for (const name in programAttributes) {
            const programAttribute = programAttributes[name];
            if (programAttribute.location >= 0) {
                let geometryAttribute: any = geometryAttributes[name];

                if (geometryAttribute === undefined) {
                    if (name === 'instanceMatrix' && object.instanceMatrix) geometryAttribute = object.instanceMatrix;
                    if (name === 'instanceColor' && object.instanceColor) geometryAttribute = object.instanceColor;
                }

                if (geometryAttribute !== undefined) {
                    const normalized = geometryAttribute.normalized;
                    const size = geometryAttribute.itemSize;

                    const attribute = this.attributes.get(geometryAttribute);

                    // TODO Attribute may not be available on context restore

                    if (attribute === undefined) continue;

                    const buffer = attribute.buffer;
                    const type = attribute.type;
                    const bytesPerElement = attribute.bytesPerElement;

                    if (geometryAttribute.isInterleavedBufferAttribute) {

                        const data = geometryAttribute.data;
                        const stride = data.stride;
                        const offset = geometryAttribute.offset;

                        if (data && data.isInstancedInterleavedBuffer) {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                this.enableAttributeAndDivisor(programAttribute.location + i, data.meshPerAttribute);

                            }

                            if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                                geometry._maxInstanceCount = data.meshPerAttribute * data.count;

                            }

                        } else {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                this.enableAttribute(programAttribute.location + i);

                            }

                        }

                        this.gl.bindBuffer(GL.ARRAY_BUFFER, buffer);

                        for (let i = 0; i < programAttribute.locationSize; i++) {

                            this.vertexAttribPointer(
                                programAttribute.location + i,
                                size / programAttribute.locationSize,
                                type,
                                normalized,
                                stride * bytesPerElement,
                                (offset + (size / programAttribute.locationSize) * i) * bytesPerElement
                            );

                        }

                    } else {

                        if (geometryAttribute.isInstancedBufferAttribute) {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                this.enableAttributeAndDivisor(programAttribute.location + i, geometryAttribute.meshPerAttribute);

                            }

                            if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                                geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

                            }

                        } else {

                            for (let i = 0; i < programAttribute.locationSize; i++) {

                                this.enableAttribute(programAttribute.location + i);

                            }

                        }

                        this.gl.bindBuffer(GL.ARRAY_BUFFER, buffer);

                        for (let i = 0; i < programAttribute.locationSize; i++) {

                            this.vertexAttribPointer(
                                programAttribute.location + i,
                                size / programAttribute.locationSize,
                                type,
                                normalized,
                                size * bytesPerElement,
                                (size / programAttribute.locationSize) * i * bytesPerElement
                            );

                        }

                    }

                } else if (materialDefaultAttributeValues !== undefined) {

                    const value = materialDefaultAttributeValues[name];

                    if (value !== undefined) {

                        switch (value.length) {

                            case 2:
                                this.gl.vertexAttrib2fv(programAttribute.location, value);
                                break;

                            case 3:
                                this.gl.vertexAttrib3fv(programAttribute.location, value);
                                break;

                            case 4:
                                this.gl.vertexAttrib4fv(programAttribute.location, value);
                                break;

                            default:
                                this.gl.vertexAttrib1fv(programAttribute.location, value);

                        }

                    }

                }

            }

        }

        this.disableUnusedAttributes();

    }
    disableUnusedAttributes() {
        const newAttributes = this.currentState.newAttributes;
        const enabledAttributes = this.currentState.enabledAttributes;

        for (let i = 0, il = enabledAttributes.length; i < il; i++) {

            if (enabledAttributes[i] !== newAttributes[i]) {
                this.gl.disableVertexAttribArray(i);
                enabledAttributes[i] = 0;
            }

        }
    }
    vertexAttribPointer(index: any, size: number, type: any, normalized: boolean, stride: number, offset: number) {
        if (type === this.gl.INT || type === this.gl.UNSIGNED_INT) {
            this.gl.vertexAttribIPointer(index, size, type, stride, offset);
        } else {
            this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
        }
    }

    saveCache(geometry: BufferGeometry, index: BufferAttribute) {
        const cache: any = {};
        const attributes = geometry.attributes;
        let attributesNum = 0;

        for (const key in attributes) {

            const attribute: any = attributes[key];

            const data: any = {};
            data.attribute = attribute;

            if (attribute.data) {
                data.data = attribute.data;
            }

            cache[key] = data;

            attributesNum++;
        }

        this.currentState.attributes = cache;
        this.currentState.attributesNum = attributesNum;

        this.currentState.index = index;

    }

    /**
     * 检测几何体是否发生了改变
     * @param geometry 
     * @param index 
     * @returns 
     */
    needsUpdate(geometry: BufferGeometry, index: BufferAttribute | undefined): boolean {
        const cachedAttributes = this.currentState.attributes;
        const geometryAttributes = geometry.attributes;

        let attributesNum = 0;

        for (const key in geometryAttributes) {
            const cachedAttribute = (cachedAttributes as any)[key];
            const geometryAttribute: any = geometryAttributes[key];

            if (cachedAttribute === undefined) return true;
            if (cachedAttribute.attribute !== geometryAttribute) return true;
            if (cachedAttribute.data !== geometryAttribute.data) return true;

            attributesNum++;
        }

        if (this.currentState.attributesNum !== attributesNum) return true;

        if (this.currentState.index !== index) return true;

        return false;
    }


    /**
     * 获取绑定状态
     * @param geometry 
     * @param program 
     * @param material 
     * @returns 
     */
    getBindingState(geometry: BufferGeometry, program: GLProgram, material: Material): IBindingState {
        const wireframe = material.wireframe === true;

        let programDic = (this.bindingStates as any)[geometry.id];
        if (!programDic) {
            programDic = {};
            (this.bindingStates as any)[geometry.id] = programDic;
        }

        let stateDic = programDic[program.id]
        if (!stateDic) {
            stateDic = {};
            programDic[program.id] = stateDic;
        }

        let state: IBindingState = stateDic[wireframe as any];
        if (!state) {
            state = this.createBindingState()
            stateDic[wireframe as any] = state;
        }

        return state;
    }



    createBindingState(): IBindingState {
        const vao: WebGLVertexArrayObject = this.gl.createVertexArray()!;

        const newAttributes = [];
        const enabledAttributes = [];
        const attributeDivisors = [];

        for (let i = 0; i < this.maxVertexAttributes; i++) {

            newAttributes[i] = 0;
            enabledAttributes[i] = 0;
            attributeDivisors[i] = 0;

        }

        return {
            // for backward compatibility on non-VAO support browser
            geometry: null,
            program: null,
            wireframe: false,

            newAttributes: newAttributes,
            enabledAttributes: enabledAttributes,
            attributeDivisors: attributeDivisors,
            object: vao,
            attributes: {},
            index: null

        };
    }



}
