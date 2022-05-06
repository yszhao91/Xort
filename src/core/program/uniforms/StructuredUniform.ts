import { TextureManager } from "../../manager/texturemanager";
 

export class StructuredUniform {
    id: string;
    seq: any[];
    map: any;
    constructor(id: string) {

        this.id = id;

        this.seq = [];
        this.map = {};
    }

    setValue(gl: WebGL2RenderingContext, value: any, textures: TextureManager) {

        const seq = this.seq;

        for (let i = 0, n = seq.length; i !== n; ++i) {

            const u = seq[i];
            u.setValue(gl, value[u.id], textures);

        }

    }
}