/*
 * @Description  : 时钟 用来刷新 计算delta和elapsed
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-07 09:23:20
 * @LastEditTime : 2021-09-08 16:38:08
 * @FilePath     : \object_frame\src\core\timer.ts
 */
export interface ITimer {
    delta: number,
    elapsed: number,
}
declare global {
    interface Window {
        timer: Timer
    }
}
/**
 * 时序记录 获取运行时间和上一次运行的间隔时间
 */
export class Timer {
    autoStart: boolean;
    startTime: number;
    oldTime: number;
    running: boolean;
    timer: Performance | DateConstructor;

    _elapsedTime: number;
    _deltaTime: number;
    _time: ITimer;
    constructor(autoStart = true) {
        this.autoStart = autoStart;

        this.startTime = 0;
        this.oldTime = 0;
        this._elapsedTime = 0;
        this._deltaTime = 0;

        this.running = false;
        this.timer = performance || Date;

        this._time = { delta: 0, elapsed: 0 };
    }

    static get Instance(): Timer {
        if (!window.timer)
            window.timer = new Timer();
        return window.timer
    }

    get deltaElapsed(): ITimer {
        this._time.delta = this.delta;
        this._time.elapsed = this._elapsedTime;
        return this._time;
    }
    /**
     * 
     */
    get elapsed(): number {
        this.delta;
        return this._elapsedTime;
    }

    get delta(): number {
        if (this.autoStart && !this.running) {
            //没有运行 如果允许启动
            this.start();
            return 0;
        }

        if (this.running) {
            const newTime: any = (this.timer as any).now();

            this._deltaTime = (newTime - this.oldTime) / 1000;
            this.oldTime = newTime;

            this._elapsedTime += this._deltaTime;
        }

        return this._deltaTime;
    }

    start() {

        this.startTime = (this.timer as any).now();
        this.oldTime = this.startTime;
        this._elapsedTime = 0;
        this.running = true;

    }

    stop() {

        this.elapsed;
        this.running = false;
        this.autoStart = false;

    }


}


