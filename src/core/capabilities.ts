/**
 * webgl的能力和限制,基本配置
 */

export class Capabilites { 
    private _context: WebGL2RenderingContext;
    maxTextures: number;
    maxVertexTextures: number;
    maxTextureSize: number;
    maxCubemapSize: number;
    maxAttributes: number;
    maxVertexUniforms: number;
    maxVaryings: number;
    maxFragmentUniforms: number;
    vertexTextures: boolean; 
  
    constructor(context: WebGL2RenderingContext) {
        this._context = context;

        this.maxTextures = this._context.getParameter(this._context.MAX_TEXTURE_IMAGE_UNITS);
        this.maxVertexTextures = this._context.getParameter(this._context.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this.maxTextureSize = this._context.getParameter(this._context.MAX_TEXTURE_SIZE);
        this.maxCubemapSize = this._context.getParameter(this._context.MAX_CUBE_MAP_TEXTURE_SIZE);

        this.maxAttributes = this._context.getParameter(this._context.MAX_VERTEX_ATTRIBS);
        this.maxVertexUniforms = this._context.getParameter(this._context.MAX_VERTEX_UNIFORM_VECTORS);
        this.maxVaryings = this._context.getParameter(this._context.MAX_VARYING_VECTORS);
        this.maxFragmentUniforms = this._context.getParameter(this._context.MAX_FRAGMENT_UNIFORM_VECTORS);

        this.vertexTextures = this.maxVertexTextures > 0;
    }

}