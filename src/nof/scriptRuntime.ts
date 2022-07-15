const RegxClassName = /class\s+(\w+)\s*\{*/g;
const RegxPropsName = /this\.\$(\w+)\s*=/g;

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

    // static _loadScriptContentAsync = async (code: string, id?: any, type?: string) => {
    //     return new Promise((resolve, reject) => {
    //         const classNames = ScriptRuntime.extractClassName(code);
    //         if (classNames.length > 0) {
    //             // code = `if(${classes[0][1]}) ${classes[0][1]} = null;\n` + code;
    //             // code += `\n window.classes.${classes[0][1]} = ${classes[0][1]};`
    //             code = code.replace(classNames[0][0], `window.classes.${classNames[0][1]}=class{`)
    //         }
    //         let script: HTMLScriptElement | null = document.getElementById(id) as any;

    //         if (script) {
    //             script.remove();
    //             script = null;
    //         }
    //         script = document.createElement("script")

    //         script.text = code;
    //         script.id = id;
    //         if (type)
    //             script.type = type;
    //         document.head.appendChild(script);
    //         const attributes = ScriptRuntime.extractAttributeName(script.text)
    //         if (classNames.length > 0) {
    //             window.conc.cache.scripts[classNames[0][1]] = script;
    //         }
    //         resolve({ script, classes: classNames[0][1], attributes });
    //     });
    // }

    // static _loadScriptContentAsyncEval = async (code: string, newInstanced?: boolean, id?: any, type?: string) => {
    //     return new Promise((resolve, reject) => {
    //         const classNames = ScriptRuntime.extractClassName(code) as any;
    //         if (classNames.length > 0) {
    //             // code = `if(${classes[0][1]}) ${classes[0][1]} = null;\n` + code;
    //             // code += `\n window.classes.${classes[0][1]} = ${classes[0][1]};`
    //             code = code.replace(classNames[0][0], `window.classes.${classNames[0][1]}=class ${classNames[0][1]} `)
    //         }
    //         const attributes = ScriptRuntime.extractAttributeName(code);

    //         let result: any = { classes: classNames[0][1], attributes };
    //         if (!ScriptRuntime.cache.has(code)) {
    //             eval(code);
    //             ScriptRuntime.cache.set(code, result);
    //             ScriptRuntime.cache.set(classNames[0][1].name, result);
    //             result.firstCompile = true;
    //         }

    //         if (newInstanced) {
    //             const object = new classNames[0][1]()
    //             result.object = object;
    //         }

    //         resolve(result);
    //     });
    // }

    // static newInstance = (name: string, args?: any) => {
    //     const ComClass = ScriptRuntime.cache.get(name);

    //     const object = new ComClass(args)

    //     return object;
    // }

}

// ScriptRuntime._loadScriptContentAsync(test).then(v => {

// })