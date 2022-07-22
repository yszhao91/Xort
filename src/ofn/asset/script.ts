import { Asset } from '../asset';
import { extractClassName, extractPulicAttributeName } from '../../code';
import { ScriptType } from '../components/script';

const runtimeCache: any = {}



export class ScriptAsset extends Asset {

    scriptType: ScriptType = ScriptType.Geometry;
    clazzNames: { name: string }[];
    compiled: string;
    attributes: any[]
    Com: any;

    constructor() {
        super()
    }

    set content(val: string) {
        if (val === this._content)
            return;

        this._content = val;
    }

    get content() {
        return this._content;
    }

    eval() {
        try {
            eval(this.compiled);
        } catch (error) {
            console.error(error);
            return;
        }
        this.clazzNames = extractClassName(this.content);
        this.attributes = extractPulicAttributeName(this.content);
        //暂时只采用第一个

        const clazzInfo = this.clazzNames[0];
        this.Com = window.conc.Coms[clazzInfo.name]; 
    }

    toJSON(): string {
        const asset = {
            assetType: this.assetType,
            _url: this._url,
            _content: this._content,
            id: this.id,
            createTime: this.createTime,
            parentId: this.parentId,
            scriptType: this.scriptType,
            compiled: this.compiled,
        }

        return JSON.stringify(asset);
    }

    fromJSON(val: string) {
        const assetR = JSON.parse(val);
        this.assetType = assetR.assetType;
        this._url = assetR._url;
        this._content = assetR._content;
        this.id = assetR.id;
        this.createTime = assetR.createTime;
        this.parentId = assetR.parentId;
        this.scriptType = assetR.scriptType;
        this.compiled = assetR.compiled;
 
    }
}