const RegxClassName = /class\s+(\w+)\s*\{*/g;
const RegxPropsName = /this\.\$(\w+)\s*=/g;
const RegxPPropsName = /public\s+(.*)?:\s*(\w+)\s*(=\s*(.[^\;]*))?\;?/g;
declare global {
    interface Window {
        conc: any;
    }
}

window.conc = window.conc || {
    Coms: {},
    scriptClass: {}
}

export interface IScriptRuntime {
    firstCompile?: boolean;
    script?: HTMLScriptElement;
    classes: any,
    attributes: any
}

export class ScriptRuntime {

    static codeChannel: BroadcastChannel = new BroadcastChannel('ScriptRuntime')
    /**
     * 同样代码不要二次加载，已经加载的代码的缓存
     */
    static cache: Map<any, any> = new Map()
    static stringCache: Map<any, any> = new Map()
    /**
     * 考虑脚本属性的数据类型 
     * 基本类型 boolean,number,string,array,vec(2/3/4),
     * other(全部以文件形式来附加数据)
     */
    static extractClassName = (code: string) => {
        const iterator = code.matchAll(RegxClassName);
        const result = [];
        for (const val of iterator) {
            result.push(val);
        }
        return result;
    }

    static extractAttributeName = (code: string) => {
        const iterator = code.matchAll(RegxPropsName);
        const result = [];
        for (const val of iterator) {
            result.push(val);
        }
        return result;
    }

    static extractPulicAttributeName = (code: string) => {
        const iterator = code.matchAll(RegxPPropsName);
        const result = [];
        for (const val of iterator) {
            result.push({ name: val[1], type: val[2], value: val[4] });
        }
        return result;
    }


    static _loadScriptAsync = async (url: string, type?: string) => {
        return new Promise((resolve, reject) => {
            let script = document.createElement("script");
            script.src = url;
            document.head.appendChild(script);
            if (type)
                script.type = type;
            script.onload = () => {
                const classes = ScriptRuntime.extractClassName(script.text)
                const attributes = ScriptRuntime.extractAttributeName(script.text)
                resolve({ script, classes, attributes });
            };
        });
    }


}
