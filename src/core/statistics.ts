/**
 * 对绘制场景进行统计
 */
export class Statistics {
    memory: { geometries: number; };
    constructor() {
        this.memory = {
            geometries :0 
        }
    }
}