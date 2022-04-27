/*
 * @Description  : 节流调用优化
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-07 09:17:27
 * @LastEditTime : 2021-09-08 15:01:59
 * @FilePath     : \object_frame\src\utils\optimize.ts
 */
export class Optimize {
    /**
     * 控制调用间隔 但是漏数据,没有开始执行的就清除掉
     * @param {*} callback 
     * @param {*} delay 
     */
    static debounce(callback: Function, delay: number) {

        let t: number | any = undefined;

        return (...args: any) => {
            if (t) {
                clearTimeout(t);
            }

            t = setTimeout(() => {
                callback(...args);
            }, delay || 300);
        }
    }


    /**
     * 控制调用次数 但是不漏数据，还有没执行完的就等待
     * @param {*} callback 
     * @param {*} delay 
     */
    static throttle(callback: Function, delay: number) {

        let t: number | undefined | any = undefined;

        return (...args: any) => {
            if (!t) {
                t = setTimeout(() => {
                    callback(...args);
                    t = null;
                }, delay || 300);
            }

        }
    }
}