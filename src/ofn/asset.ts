import { Thing } from './utils/thing';
import { World } from './world';
import { ScriptRuntime } from './scriptRuntime';

export enum FileType {
    Text,
    Binary,
    Image,
    Audio,
    Video,
}

/**
 * @description :  Asset 可以考虑放在资源管理器中
 * @param        {*}
 * @return       {*}
 * @example     : 
 */
export class Asset extends Thing {
    static CHANGE = "Asset#Change";
    //文件的类型` 
    assetType?: FileType;
    // 如果是文本 , 文本的内容
    protected _content: any = '';
    //链接
    protected _url: string = "";
    createTime: number = Date.now();

    // md5 hash码 用来快速判断文件是否相同
    hash: string = "";
    parentId?: number;
    //格式
    format?: string;

    protected _world: World;

    constructor() {
        super();
    }

    get content() { 
        return this._content;
    }

    set content(val: string) {
        this._content = val;
    }

    toJson() {
        const asset = {
            assetType: this.assetType,
            _url: this._url,
            _content: this._content,
            id: this.id,
            createTime: this.createTime,
            parentId: this.parentId
        }

        return JSON.stringify(asset);
    }

    fromJson(val: string) {
        const assetR = JSON.parse(val);
        this.assetType = assetR.assetType; 
        this._url = assetR._url; 
        this._content = assetR._content; 
        this.id = assetR.id; 
        this.createTime = assetR.createTime; 
        this.parentId = assetR.parentId; 
    }
}