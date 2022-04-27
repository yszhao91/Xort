import { Component } from "./component";
import { IDescriptor } from './thing';

export interface IAsset {
    id: string | number;
    assetType?: string;
    fetch?: Function;
}


/**
 * @description :  Asset 可以考虑放在资源管理器中
 * @param        {*}
 * @return       {*}
 * @example     : 
 */
export abstract class Asset extends Component<any> implements IAsset {
    //文件的类型`

    assetType?: string;
    // 如果是文本 , 文本的内容
    content?: any = '';
    //链接
    url: string = "";
    createTime: number = Date.now();
    // md5 hash码 用来快速判断文件是否相同
    hash: string = "";
    parentId?: number;
    //格式
    format?: string;

    constructor() {
        super();
    }

    onChange(attr: IDescriptor) {

        // if (saveToServe)
        //     window.editor.fire(WBEvent.Up, this.entity);
    }

    save() {

    }

}