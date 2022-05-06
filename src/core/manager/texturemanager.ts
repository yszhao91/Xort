 export interface ITextureCache {
    currentAnisotropy: number;
    maxMipLevel: number;
    webglTexture: WebGLTexture | null;
    webglInit: boolean | undefined;
    version: number;
}

export interface IRenderTargetCache {
    webglDepthbuffer: any;
    webglTexture: WebGLTexture | null;
    version: number;
    webglMultisampledFramebuffer: WebGLFramebuffer | null;
    webglColorRenderbuffer: WebGLRenderbuffer | null;
    webglDepthRenderbuffer: WebGLRenderbuffer;
    webglFramebuffer: any
}

export class TextureManager { 
    memory: any = { textures: 0 };
    _canvas!: HTMLCanvasElement | OffscreenCanvas | any;
    useOffscreenCanvas: boolean = false;
    maxTextureSize: number = 2048;
    _videoTextures: any;
    render: any;
    onTextureDispose: any;
    glCache: GLCache;
    maxTextures: number;
    maxSamples: number;
    constructor(private gl: WebGL2RenderingContext, glCache: GLCache) {

        this.glCache = glCache;

        this.useOffscreenCanvas = typeof OffscreenCanvas !== 'undefined' && new OffscreenCanvas(1, 1).getContext('2d') !== null;
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.maxSamples = gl.getParameter(gl.MAX_SAMPLES)
    }

    /**
     * 初始化RenderTarget,生成或者提取所有必须的webgl对象和数据
     * @param renderTarget 
     */
    setupRenderTarget(renderTarget: RenderTarget) {
        const texture: Texture = renderTarget.texture as any;

        const renderTargetCache = this.glCache.get<IRenderTargetCache>(renderTarget);
        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (renderTarget.type !== RenderTargetType.Multiple) {
            renderTargetCache.webglTexture = this.gl.createTexture();
            renderTargetCache.version = texture.version;
            this.memory.textures++;
        }

        const isCube = (renderTarget.type === RenderTargetType.Cube);
        const isMultipleRenderTargets = (renderTarget.type === RenderTargetType.Multiple);
        const isMultisample = (renderTarget.type === RenderTargetType.MultipleSampler);
        const isRenderTarget3D = texture.isDataTexture3D || texture.isDataTexture2DArray;
        const supportsMips = true;


        if (texture.format === GL.RGB && (texture.type === GL.FLOAT || texture.type === GL.HALF_FLOAT)) {
            texture.format = GL.RGBA;
            console.warn('webgl2: 渲染不支持rgb格式，换成rgba格式');
        }

        // 创建FrameBuffer
        if (isCube) {
            renderTargetCache.webglFramebuffer = [];
            for (let i = 0; i < 6; i++) {
                (renderTargetCache as any).webglFramebuffer[i] = this.gl.createFramebuffer();
            }
        } else {
            (renderTargetCache as any).webglFramebuffer = this.gl.createFramebuffer();
            if (isMultipleRenderTargets) {
                //webgl2 支持
                const textures: Texture[] = renderTarget.texture as any;
                if (!Array.isArray(textures))
                    console.log('此处纹理应该是数组')

                for (let i = 0, il = textures.length; i < il; i++) {
                    const attachmentProperties = this.glCache.get<ITextureCache>(textures[i]);

                    if (attachmentProperties.webglTexture === undefined) {
                        attachmentProperties.webglTexture = this.gl.createTexture();
                        this.memory.textures++;
                    }
                }

            } else if (isMultisample) {
                renderTargetCache.webglMultisampledFramebuffer = this.gl.createFramebuffer();
                renderTargetCache.webglColorRenderbuffer = this.gl.createRenderbuffer();

                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderTargetCache.webglColorRenderbuffer);

                const glFormat = texture.format;
                const glType = texture.type;
                const glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.encoding);
                const samples = this.getRenderTargetSamples(renderTarget);
                this.gl.renderbufferStorageMultisample(this.gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height);

                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, renderTargetCache.webglMultisampledFramebuffer);
                this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.RENDERBUFFER, renderTargetCache.webglColorRenderbuffer);
                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

                if (renderTarget.depthBuffer) {
                    renderTargetCache.webglDepthRenderbuffer = this.gl.createRenderbuffer()!;
                    this.setupRenderBufferStorage(renderTargetCache.webglDepthRenderbuffer, renderTarget, true);
                }

                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            }

            // Setup color buffer
            if (isCube) {

                this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, textureCache.webglTexture);
                this.setTextureParameters(GL.TEXTURE_CUBE_MAP, texture, supportsMips);

                for (let i = 0; i < 6; i++) {

                    this.setupFrameBufferTexture((renderTargetCache.webglFramebuffer as any)[i], renderTarget, texture, GL.COLOR_ATTACHMENT0, GL.TEXTURE_CUBE_MAP_POSITIVE_X + i);

                }

                if (this.textureNeedsGenerateMipmaps(texture, supportsMips)) {

                    this.generateMipmap(this.gl.TEXTURE_CUBE_MAP, texture, renderTarget.width, renderTarget.height);

                }

                this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, null);

            } else if (isMultipleRenderTargets) {

                const textures = renderTarget.texture as any as Texture[];
                if (!Array.isArray(textures))
                    console.error('此处应该为纹理数组')

                for (let i = 0, il = textures.length; i < il; i++) {

                    const attachment = textures[i];
                    const attachmentProperties = this.glCache.get<ITextureCache>(attachment);

                    this.gl.bindTexture(GL.TEXTURE_2D, attachmentProperties.webglTexture);
                    this.setTextureParameters(GL.TEXTURE_2D, attachment, supportsMips);
                    this.setupFrameBufferTexture(renderTargetCache.webglFramebuffer, renderTarget, attachment, GL.COLOR_ATTACHMENT0 + i, GL.TEXTURE_2D);

                    if (this.textureNeedsGenerateMipmaps(attachment, supportsMips)) {

                        this.generateMipmap(GL.TEXTURE_2D, attachment, renderTarget.width, renderTarget.height);

                    }

                }

                this.gl.bindTexture(GL.TEXTURE_2D, null);

            } else {

                let glTextureType = GL.TEXTURE_2D;

                if (isRenderTarget3D) {
                    // Render targets containing layers, i.e: Texture 3D and 2d arrays 
                    const isTexture3D = texture.isDataTexture3D;
                    glTextureType = isTexture3D ? GL.TEXTURE_3D : GL.TEXTURE_2D_ARRAY;

                }

                this.gl.bindTexture(glTextureType, textureCache.webglTexture);
                this.setTextureParameters(glTextureType, texture, supportsMips);
                this.setupFrameBufferTexture(renderTargetCache.webglFramebuffer, renderTarget, texture, GL.COLOR_ATTACHMENT0, glTextureType);

                if (this.textureNeedsGenerateMipmaps(texture, supportsMips)) {

                    this.generateMipmap(glTextureType, texture, renderTarget.width, renderTarget.height, renderTarget.depth);

                }

                this.gl.bindTexture(glTextureType, null);
            }

            // Setup depth and stencil buffers

            if (renderTarget.depthBuffer) {

                this.setupDepthRenderbuffer(renderTarget);

            }
        }
    }
    setupRenderBufferStorage(webglDepthRenderbuffer: WebGLRenderbuffer, renderTarget: RenderTarget, arg2: boolean) {
        throw new Error("Method not implemented.");
    }

    setupDepthRenderbuffer(renderTarget: RenderTarget) {
        const renderTargetProperties = this.glCache.get<IRenderTargetCache>(renderTarget);

        const isCube = (renderTarget.type === RenderTargetType.Cube);

        if (renderTarget.depthTexture) {

            if (isCube) throw new Error('target.depthTexture not supported in Cube render targets');

            this.setupDepthTexture(renderTargetProperties.webglFramebuffer, renderTarget);

        } else {

            if (isCube) {

                renderTargetProperties.webglDepthbuffer = [];

                for (let i = 0; i < 6; i++) {

                    this.gl.bindFramebuffer(GL.FRAMEBUFFER, renderTargetProperties.webglFramebuffer[i]);
                    renderTargetProperties.webglDepthbuffer[i] = this.gl.createRenderbuffer();
                    this.setupRenderBufferStorage(renderTargetProperties.webglDepthbuffer[i], renderTarget, false);

                }

            } else {

                this.gl.bindFramebuffer(GL.FRAMEBUFFER, renderTargetProperties.webglFramebuffer);
                renderTargetProperties.webglDepthbuffer = this.gl.createRenderbuffer();
                this.setupRenderBufferStorage(renderTargetProperties.webglDepthbuffer, renderTarget, false);

            }

        }

        this.gl.bindFramebuffer(GL.FRAMEBUFFER, null);

    }
    setupDepthTexture(framebuffer: any, renderTarget: RenderTarget) {
        const isCube = (renderTarget && renderTarget.type == RenderTargetType.Cube);
        if (isCube) throw new Error('Depth Texture with cube render targets is not supported');

        this.gl.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);

        if (!(renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture)) {

            throw new Error('renderTarget.depthTexture must be an instance of THREE.DepthTexture');

        }

        // upload an empty depth texture with framebuffer size
        if (!this.glCache.get<ITextureCache>(renderTarget.depthTexture).webglTexture ||
            renderTarget.depthTexture.image.width !== renderTarget.width ||
            renderTarget.depthTexture.image.height !== renderTarget.height) {

            renderTarget.depthTexture.image.width = renderTarget.width;
            renderTarget.depthTexture.image.height = renderTarget.height;
            renderTarget.depthTexture.needsUpdate = true;

        }

        this.setTexture2D(renderTarget.depthTexture, 0);

        const webglDepthTexture = this.glCache.get<ITextureCache>(renderTarget.depthTexture).webglTexture;

        if (renderTarget.depthTexture.format === GL.DEPTH_ATTACHMENT) {

            this.gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, webglDepthTexture, 0);

        } else if (renderTarget.depthTexture.format === GL.DEPTH_STENCIL_ATTACHMENT) {

            this.gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.TEXTURE_2D, webglDepthTexture, 0);

        } else {

            throw new Error('Unknown depthTexture format');

        }
    }
    getRenderTargetSamples(renderTarget: RenderTarget) {
        return (renderTarget.type === RenderTargetType.MultipleSampler) ?
            Math.min(this.maxSamples, renderTarget.samples) : 0
    }
    setupFrameBufferTexture(framebuffer: WebGLFramebuffer, renderTarget: RenderTarget, texture: Texture, attachment: number, textureTarget: number) {
        const glFormat = texture.format;
        const glType = texture.type;
        const glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.encoding);

        if (textureTarget === GL.TEXTURE_3D || textureTarget === GL.TEXTURE_2D_ARRAY) {

            this.gl.texImage3D(textureTarget, 0, glInternalFormat, renderTarget.width, renderTarget.height, renderTarget.depth, 0, glFormat, glType, null);

        } else {

            this.gl.texImage2D(textureTarget, 0, glInternalFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);

        }

        this.gl.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
        this.gl.framebufferTexture2D(GL.FRAMEBUFFER, attachment, textureTarget, this.glCache.get<ITextureCache>(texture).webglTexture, 0);
        this.gl.bindFramebuffer(GL.FRAMEBUFFER, null);
    }


    textureUnits: number = 0;

    resetTextureUnits() {
        this.textureUnits = 0;
    }

    allocateTextureUnit() {
        const textureUnit = this.textureUnits;

        if (textureUnit >= this.maxTextures) {

            console.warn('Xort: 尝试使用纹理单元: ' + textureUnit + ' GPU支持的纹理数量 ' + this.maxTextures);

        }

        this.textureUnits += 1;

        return textureUnit;
    }


    deallocateTexture(texture: Texture) {

        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (textureCache.webglInit === undefined) return;

        this.gl.deleteTexture(textureCache.webglTexture);

        this.glCache.remove(texture);

    }

    isPowerOf2(value: number) {
        return (value & (value - 1)) == 0;
    }

    isPowerOfTwo(image: ImageBitmap) {
        return this.isPowerOf2(image.width) && this.isPowerOf2(image.height);
    }


    textureNeedsPowerOfTwo(texture: Texture) {
        return (texture.wrapS !== GL.CLAMP_TO_EDGE || texture.wrapT !== GL.CLAMP_TO_EDGE) ||
            (texture.minFilter !== GL.NEAREST && texture.minFilter !== GL.LINEAR);
    }

    createCanvas(width: number, height: number) {
        // Use OffscreenCanvas when available. Specially needed in web workers 
        return this.useOffscreenCanvas ? new OffscreenCanvas(width, height) : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

    }

    /**
     * 将图片大小转为2的幂次方
     * @param image 图片
     * @param needsPowerOfTwo 是否是2的幂次方
     * @param needsNewCanvas  是否新建canvas
     * @param maxSize 最大尺寸
     * @returns 
     */
    resizeImage(image: ImageBitmap | HTMLImageElement | HTMLCanvasElement, needsPowerOfTwo: boolean, needsNewCanvas: boolean, maxSize: number) {

        let scale = 1;
        // handle case if texture exceeds max size 
        if (image.width > maxSize || image.height > maxSize) {
            scale = maxSize / Math.max(image.width, image.height);
        }

        // only perform resize if necessary
        if (scale < 1 || needsPowerOfTwo === true) {
            // only perform resize for certain image types
            if ((typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
                (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
                (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)) {


                const width = Math.floor(scale * image.width);
                const height = Math.floor(scale * image.height);

                if (this._canvas === undefined) this._canvas = this.createCanvas(width, height);

                // cube textures can't reuse the same canvas

                const canvas = needsNewCanvas ? this.createCanvas(width, height) : this._canvas;

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, width, height);

                console.warn('Xort: 纹理大小重置 从 (' + image.width + 'x' + image.height + ') 到 (' + width + 'x' + height + ').');
                return canvas;

            } else {
                if ('data' in image) {
                    console.warn('Xort: Image in DataTexture is too big (' + (image as any).width + 'x' + (image as any).height + ').');
                }
                return image;
            }
        }
        return image;
    }

    /**
     * 初始化一个Webgl纹理
     * @param texture 
     */
    initTexture(texture: Texture) {
        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (textureCache.webglInit === undefined) {

            textureCache.webglInit = true;
            texture.fire('dispose', this.onTextureDispose);
            textureCache.webglTexture = this.gl.createTexture();
            this.memory.textures++;

        }
    }

    getInternalFormat(internalFormatName: InternalFormat | undefined, glFormat: number, glTarget: number, encoding: any) {
        const _gl: any = this.gl

        if (internalFormatName !== undefined) {
            if (_gl[internalFormatName] !== undefined) return _gl[internalFormatName];
            console.warn('Xort: Attempt to use non-existing WebGL internal format \'' + internalFormatName + '\'');
        }

        let internalFormat = glFormat;

        if (glFormat === _gl.RED) {
            if (glTarget === _gl.FLOAT) internalFormat = _gl.R32F;
            if (glTarget === _gl.HALF_FLOAT) internalFormat = _gl.R16F;
            if (glTarget === _gl.UNSIGNED_BYTE) internalFormat = _gl.R8;
        }

        if (glFormat === _gl.RGB) {
            if (glTarget === _gl.FLOAT) internalFormat = _gl.RGB32F;
            if (glTarget === _gl.HALF_FLOAT) internalFormat = _gl.RGB16F;
            if (glTarget === _gl.UNSIGNED_BYTE) internalFormat = _gl.RGB8;
        }

        if (glFormat === _gl.RGBA) {
            if (glTarget === _gl.FLOAT) internalFormat = _gl.RGBA32F;
            if (glTarget === _gl.HALF_FLOAT) internalFormat = _gl.RGBA16F;
            if (glTarget === _gl.UNSIGNED_BYTE) internalFormat = encoding === 'sRGBEncoding' ? _gl.SRGB8_ALPHA8 : _gl.RGBA8;
        }

        if (internalFormat === _gl.R16F || internalFormat === _gl.R32F || internalFormat === _gl.RGBA16F || internalFormat === _gl.RGBA32F) {
            this.gl.getExtension('EXT_color_buffer_float');
        }

        return internalFormat;
    } // Fallback filters for non-power-of-2 textures


    /**
     * 生成minmap
     * @param target 
     * @param texture 
     * @param width 
     * @param height 
     * @param depth 
     */
    generateMipmap(target: TextureTarget, texture: Texture, width: number, height: number, depth: number = 1) {
        this.gl.generateMipmap(target);

        const textureCache = this.glCache.get<ITextureCache>(texture)

        textureCache.maxMipLevel = Math.log2(Math.max(width, height, depth));
    }

    /**
     * 紋理是否需要生成MipMap
     *  NEAREST LINEAR 不需要
     * @param texture 
     * @param supportsMips 
     * @returns 
     */
    textureNeedsGenerateMipmaps(texture: Texture, supportsMips: boolean) {
        return texture.generateMipmaps
            && supportsMips
            && texture.minFilter !== FilterType.NEAREST
            && texture.minFilter !== FilterType.LINEAR;
    }

    /**
     * 如果不支持mipmap，重置過濾參數
     * @param filter 
     * @returns 
     */
    filterFallback(filter: FilterType) {
        if (filter === FilterType.NEAREST || filter === FilterType.NEAREST_MIPMAP_NEAREST || filter === FilterType.NEAREST_MIPMAP_LINEAR) {
            return GL.NEAREST;
        }
        return GL.LINEAR;
    }

    /**
     * 设置纹理属性  Wrap与Filter
     * @param textureType 
     * @param texture 
     * @param supportsMips 
     */
    setTextureParameters(textureType: TextureTarget, texture: Texture, supportsMips: boolean) {
        const _gl = this.gl;
        if (supportsMips) {
            _gl.texParameteri(textureType, WrapType.S, texture.wrapS);
            _gl.texParameteri(textureType, WrapType.T, texture.wrapT);

            if (textureType === _gl.TEXTURE_3D || textureType === _gl.TEXTURE_2D_ARRAY) {
                _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_R, texture.wrapR);
            }

            _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, texture.magFilter);
            _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, texture.minFilter);

        } else {

            _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
            _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);

            if (textureType === _gl.TEXTURE_3D || textureType === _gl.TEXTURE_2D_ARRAY) {
                _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_R, _gl.CLAMP_TO_EDGE);
            }

            if (texture.wrapS !== WrapVal.CLAMP_TO_EDGE || texture.wrapT !== WrapVal.CLAMP_TO_EDGE) {
                console.warn('Xort: 纹理大小不是二的幂.Texture.wrapS 和 Texture.wrapT 应该设置为CLAMP_TO_EDGE');
            }

            _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, this.filterFallback(texture.magFilter));
            _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, this.filterFallback(texture.minFilter));

            if (texture.minFilter !== FilterType.NEAREST && texture.minFilter !== FilterType.LINEAR) {
                console.warn('Xort: 纹理大小不是二的幂. Texture.minFilter 应该设置为 NEAREST 和LINEAR');
            }

        }

        const extension = this.gl.getExtension('EXT_texture_filter_anisotropic');
        if (extension !== null) {
            //TODO 暂时不考虑通向各异性
            // if (texture.target === GL.FLOAT && this.gl.getExtension('OES_texture_float_linear') === false) return; // verify extension for WebGL 1 and WebGL 2
            // if ((texture.type === GL.HALF_FLOAT && this.gl.getExtension('OES_texture_half_float_linear') === false)) return; // verify extension for WebGL 1 only

            // if (texture.anisotropy > 1 || this.glCache.get<ITextureCache>(texture).currentAnisotropy) {

            //     _gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT,
            //         Math.min(texture.anisotropy, this.gl.getParameter(GL.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
            //     this.glCache.get<ITextureCache>(texture).currentAnisotropy = texture.anisotropy;

            // }

        }
    }

    /**
     * 设置纹理，绑定到shader上
     * @param texture  纹理
     * @param slot  纹理单元
     * @returns 
     */
    setTexture2D(texture: Texture, slot: number) {
        const gl = this.gl;
        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (texture.type === TextureType.Video)
            this.updateVideoTexture(texture);

        if (texture.version > 0 && textureCache.version !== texture.version) {

            const image = texture.image;

            if (image === undefined) {
                console.warn('Xort: 纹理标记为更新，但图像未定义');
            } else if ((image as HTMLImageElement).complete === false) {
                console.warn('Xort: 纹理标记为更新，但图像不完整');
            } else {
                this.uploadTexture(texture, slot);
                return;
            }

        }

        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, textureCache.webglTexture);

    }
    updateVideoTexture(texture: Texture) {
        const frame = this.render.frame;

        // Check the last frame we updated the VideoTexture

        if (this._videoTextures.get(texture) !== frame) {

            this._videoTextures.set(texture, frame);
            if (texture.onUpdate)
                texture.onUpdate();

        }
    }

    setTexture2DArray(texture: Texture, slot: number) {
        const gl = this.gl;
        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (texture.version > 0 && textureCache.version !== texture.version) {

            this.uploadTexture(texture, slot);
            return;

        }

        gl.activeTexture(GL.TEXTURE0 + slot);
        gl.bindTexture(GL.TEXTURE_2D_ARRAY, textureCache.webglTexture);

    }

    setTexture3D(texture: Texture, slot: number) {

        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (texture.version > 0 && textureCache.version !== texture.version) {

            this.uploadTexture(texture, slot);
            return;

        }

        this.gl.activeTexture(this.gl.TEXTURE0 + slot);
        this.gl.bindTexture(this.gl.TEXTURE_3D, textureCache.webglTexture);

    }

    setTextureCube(texture: Texture, slot: number) {
        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (texture.version > 0 && textureCache.version !== texture.version) {

            this.uploadCubeTexture(texture, slot);
            return;

        }

        this.gl.activeTexture(GL.TEXTURE0 + slot);
        this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, textureCache.webglTexture);

    }

    // backwards compatibility

    warnedTexture2D = false;
    warnedTextureCube = false;
    /**
     * 除了Texture 考虑到RenderTarget
     * @param texture 
     * @param slot 
     */
    safeSetTexture2D(texture: Texture, slot: number) {

        if (texture && texture.type === TextureType.RenderTarget) {

            if (this.warnedTexture2D === false) {

                console.warn('Xort.safeSetTexture2D: don\'t use render targets as textures. Use their .texture property instead.');
                this.warnedTexture2D = true;

            }
        }

        this.setTexture2D(texture, slot);
    }

    safeSetTextureCube(texture: Texture, slot: number) {

        if (texture && texture.type === TextureType.RenderTarget) {

            if (this.warnedTextureCube === false) {
                console.warn('Xort.safeSetTextureCube: don\'t use cube render targets as textures. Use their .texture property instead.');
                this.warnedTextureCube = true;
            }
        }

        this.setTextureCube(texture, slot);
    }

    //---upload--------------------------------------------------

    /**
     * 纹理已经准备考 开始绑定使用
     * @param texture 
     * @param slot 
     */
    uploadTexture(texture: Texture, slot: number) {
        const textureCache = this.glCache.get<ITextureCache>(texture);
        const gl = this.gl;

        let textureTarget = TextureTarget.TEXTURE_2D;

        if (texture.isDataTexture2DArray) textureTarget = TextureTarget.TEXTURE_2D_ARRAY;
        if (texture.isDataTexture3D) textureTarget = TextureTarget.TEXTURE_3D;

        this.initTexture(texture);

        gl.activeTexture(GL.TEXTURE0 + slot);
        gl.bindTexture(textureTarget, textureCache.webglTexture);

        gl.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
        gl.pixelStorei(GL.UNPACK_ALIGNMENT, texture.unpackAlignment);
        gl.pixelStorei(GL.UNPACK_COLORSPACE_CONVERSION_WEBGL, GL.NONE);

        const needsPowerOfTwo = this.textureNeedsPowerOfTwo(texture) && this.isPowerOfTwo(texture.image as any) === false;
        const image = this.resizeImage(texture.image as any, needsPowerOfTwo, false, this.maxTextureSize);

        const supportsMips = this.isPowerOf2(image),
            glFormat = texture.format;

        let glType = texture.glType,
            glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.encoding);

        this.setTextureParameters(textureTarget, texture, supportsMips);

        let mipmap;
        const mipmaps = texture.mipmaps;

        if (texture.type == TextureType.Depth) {

            // populate depth texture with dummy data

            glInternalFormat = GL.DEPTH_COMPONENT;

            if (texture.target === GL.FLOAT) {

                glInternalFormat = GL.DEPTH_COMPONENT32F;

            } else if (texture.target === GL.UNSIGNED_INT) {

                glInternalFormat = GL.DEPTH_COMPONENT24;

            } else if (texture.target === GL.UNSIGNED_INT_24_8) {

                glInternalFormat = GL.DEPTH24_STENCIL8;

            } else {

                glInternalFormat = GL.DEPTH_COMPONENT16; // WebGL2 requires sized internalformat for glTexImage2D

            }


            // validation checks for WebGL 1

            if (texture.format === gl.DEPTH_COMPONENT && glInternalFormat === gl.DEPTH_COMPONENT) {

                // The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
                // DEPTH_COMPONENT and type is not UNSIGNED_SHORT or UNSIGNED_INT
                // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
                if (texture.target !== gl.UNSIGNED_SHORT && texture.target !== gl.UNSIGNED_INT) {

                    console.warn('THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture.');

                    texture.target = GL.UNSIGNED_SHORT;
                    glType = texture.glType;

                }

            }

            if (texture.format === GL.DEPTH_STENCIL && glInternalFormat === gl.DEPTH_COMPONENT) {
                // Depth stencil textures need the DEPTH_STENCIL internal format
                // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
                glInternalFormat = gl.DEPTH_STENCIL;

                // The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
                // DEPTH_STENCIL and type is not UNSIGNED_INT_24_8_WEBGL.
                // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
                if (texture.target !== GL.UNSIGNED_INT_24_8) {
                    console.warn('THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture.');

                    texture.target = GL.UNSIGNED_INT_24_8;
                    glType = texture.glType;
                }

            }

            gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, null);

        } else if (texture.type === TextureType.Data) {
            if (mipmaps.length > 0 && supportsMips) {

                for (let i = 0, il = mipmaps.length; i < il; i++) {

                    mipmap = mipmaps[i];
                    gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);

                }

                texture.generateMipmaps = false;
                textureCache.maxMipLevel = mipmaps.length - 1;

            } else {

                gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, image.data);
                textureCache.maxMipLevel = 0;

            }

        } else if (texture.isCompressed) {

            for (let i = 0, il = mipmaps.length; i < il; i++) {

                mipmap = mipmaps[i];

                if (texture.format !== gl.RGBA && texture.format !== gl.RGBA) {

                    if (glFormat !== null) {

                        gl.compressedTexImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data);

                    } else {

                        console.warn('THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()');

                    }

                } else {

                    gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);

                }

            }

            textureCache.maxMipLevel = mipmaps.length - 1;

        } else if (texture.isDataTexture2DArray) {

            gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data);
            textureCache.maxMipLevel = 0;

        } else if (texture.isDataTexture3D) {

            gl.texImage3D(gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data);
            textureCache.maxMipLevel = 0;

        } else {

            // regular Texture (image, video, canvas)

            // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels

            if (mipmaps.length > 0 && supportsMips) {

                for (let i = 0, il = mipmaps.length; i < il; i++) {

                    mipmap = mipmaps[i];
                    gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);

                }

                texture.generateMipmaps = false;
                textureCache.maxMipLevel = mipmaps.length - 1;

            } else {

                gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
                textureCache.maxMipLevel = 0;

            }

        }

        if (this.textureNeedsGenerateMipmaps(texture, supportsMips)) {

            this.generateMipmap(textureTarget, texture, image.width, image.height);

        }

        textureCache.version = texture.version;

        if (texture.onUpdate) texture.onUpdate(texture);

    }

    uploadCubeTexture(texture: Texture, slot: number) {
        const gl = this.gl;
        const textureCache = this.glCache.get<ITextureCache>(texture);

        if (texture.image && (texture.image as any).length !== 6) return;

        this.initTexture(texture);

        gl.activeTexture(GL.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCache.webglTexture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

        const isCompressed = (texture && (texture.isCompressed
            || (texture as any).image[0].type.isCompressed));
        const isDataTexture = ((texture as any).image[0] && (texture as any).image[0].isDataTexture);

        const cubeImage = [];

        for (let i = 0; i < 6; i++) {

            if (!isCompressed && !isDataTexture) {

                cubeImage[i] = this.resizeImage((texture as any).image[i], false, true, gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));

            } else {

                cubeImage[i] = isDataTexture ? (texture as any).image[i].image : (texture as any).image[i];

            }

        }

        const image = cubeImage[0],
            supportsMips = true,
            glFormat = texture.format,
            glType = texture.type,
            glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.encoding);

        this.setTextureParameters(TextureTarget.TEXTURE_CUBE_MAP, texture, supportsMips);

        let mipmaps;

        if (isCompressed) {

            for (let i = 0; i < 6; i++) {

                mipmaps = cubeImage[i].mipmaps;

                for (let j = 0; j < mipmaps.length; j++) {

                    const mipmap = mipmaps[j];

                    if (texture.format !== GLColorType.RGBA && texture.format !== GLColorType.RGB) {

                        if (glFormat !== null) {

                            gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data);

                        } else {

                            console.warn('THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()');

                        }

                    } else {

                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);

                    }

                }

            }

            textureCache.maxMipLevel = mipmaps.length - 1;

        } else {

            mipmaps = texture.mipmaps;

            for (let i = 0; i < 6; i++) {

                if (isDataTexture) {

                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, cubeImage[i].width, cubeImage[i].height, 0, glFormat, glType, cubeImage[i].data);

                    for (let j = 0; j < mipmaps.length; j++) {

                        const mipmap = mipmaps[j];
                        const mipmapImage = mipmap.image[i].image;

                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, glInternalFormat, mipmapImage.width, mipmapImage.height, 0, glFormat, glType, mipmapImage.data);

                    }

                } else {

                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, cubeImage[i]);

                    for (let j = 0; j < mipmaps.length; j++) {

                        const mipmap = mipmaps[j];

                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, glInternalFormat, glFormat, glType, mipmap.image[i]);

                    }

                }

            }

            textureCache.maxMipLevel = mipmaps.length;

        }

        if (this.textureNeedsGenerateMipmaps(texture, supportsMips)) {

            // We assume images for cube map have the same size.
            this.generateMipmap(gl.TEXTURE_CUBE_MAP, texture, image.width, image.height);

        }

        textureCache.version = texture.version;

        if (texture.onUpdate) texture.onUpdate(texture);
    }
}