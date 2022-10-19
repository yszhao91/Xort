import { Asset } from "@xort/of"; 

export class GeometryAsset extends Asset {
    position: Array<number> =  [];
    index?: Array<number>;
    normal?: Array<number>;
    uvs?: Array<number>;
    tangent?: Array<number>;


    
}