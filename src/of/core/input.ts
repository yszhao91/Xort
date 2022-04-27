import { EventHandler } from "../core/eventhandler";
import { EventType } from "./eventtype";

/**
 *  输入设备事件管理
 */

export class Input extends EventHandler {
    //是否pointerLock
    pointerLock: boolean = false;
    isLocked: boolean = false;
    private boundOnMouseDown: (evt: any) => void;
    private boundOnMouseMove: (evt: any) => void;
    private boundOnMouseUp: (evt: any) => void;
    private boundOnMouseWheelMove: (evt: any) => void;
    private boundOnPointerlockChange: (evt: any) => void;
    private boundOnPointerlockError: (evt: any) => void;
    private boundOnKeyDown: (evt: any) => void;
    private boundOnKeyUp: (evt: any) => void;
    private _pressed: any = {};
    constructor(public domElement: HTMLElement | any = document) {
        super();
        // Bindings for later event use
        // Mouse
        this.boundOnMouseDown = (evt) => this.onMouseDown(evt);
        this.boundOnMouseMove = (evt) => this.onMouseMove(evt);
        this.boundOnMouseUp = (evt) => this.onMouseUp(evt);
        this.boundOnMouseWheelMove = (evt) => this.onMouseWheelMove(evt);

        // Pointer lock
        this.boundOnPointerlockChange = (evt) => this.onPointerlockChange(evt);
        this.boundOnPointerlockError = (evt) => this.onPointerlockError(evt);

        // Keys
        this.boundOnKeyDown = (evt) => this.onKeyDown(evt);
        this.boundOnKeyUp = (evt) => this.onKeyUp(evt);


        // Init event listeners
        // Mouse
        this.domElement.addEventListener(EventType.MOUSE_DOWN, this.boundOnMouseDown, false);
        document.addEventListener('wheel', this.boundOnMouseWheelMove, false);
        document.addEventListener('pointerlockchange', this.boundOnPointerlockChange, false);
        document.addEventListener('pointerlockerror', this.boundOnPointerlockError, false);

        // Keys
        document.addEventListener('keydown', this.boundOnKeyDown, false);
        document.addEventListener('keyup', this.boundOnKeyUp, false);
    }

    onPointerlockChange(event: MouseEvent): void {
        this.fire(EventType.POINTERLOCK_CHANGE, event);
        if (document.pointerLockElement === this.domElement) {
            this.domElement.addEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false);
            this.isLocked = true;
        }
        else {
            this.domElement.removeEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false);
            this.isLocked = false;
        }
    }

    onPointerlockError(event: MouseEvent): void {
        console.error('PointerLockControls: Unable to use Pointer Lock API');
    }

    onMouseDown(event: MouseEvent): void {
        this.fire(EventType.MOUSE_DOWN, event);
        if (this.pointerLock) {
            this.domElement.requestPointerLock();
        }
        else {
            this.domElement.addEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.fire(EventType.MOUSE_MOVE, event);
    }

    onMouseUp(event: MouseEvent): void {
        this.fire(EventType.MOUSE_UP, event);
        if (!this.pointerLock) {
            this.domElement.removeEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        this.fire(EventType.KEY_DOWN, event);
        this._pressed[event.key] = true;
    }

    onKeyUp(event: KeyboardEvent): void {
        this._pressed[event.key] = false;
        this.fire(EventType.KEY_UP, event);
    }

    onMouseWheelMove(event: WheelEvent): void {
        this.fire(EventType.WHEEL, event);
    }

    isPress(key: string): boolean {
        return !!this._pressed[key];
    }
}