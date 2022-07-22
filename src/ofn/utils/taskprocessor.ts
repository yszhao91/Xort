/*
 * @Description  : worker 多线程
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-07 09:18:03
 * @LastEditTime : 2021-09-13 10:55:34
 * @FilePath     : \object_frame\src\utils\taskprocessor.ts
 */

import { EventHandler } from './eventhandler'
import { isDefined, isUndefNull, Undefinable } from './types';
import { Defer } from './defer';

(window.Worker as any).canTransferArrayBuffer = canTransferArrayBuffer()

function canTransferArrayBuffer(): Promise<boolean> | boolean {
    if (isUndefNull((window.Worker as any).canTransferArrayBuffer)) {
        return new Promise((resolve, reject) => {
            var worker = new Worker(getWorkerUrl("../workers/transferTypedArrayTest.js"));
            var value = 99;
            var array = new Int8Array([value]);

            try {
                // transferable object 失败  说明不支持transferable
                worker.postMessage(
                    {
                        array: array,
                    },
                    [array.buffer]
                );
            } catch (e) {
                TaskProcessor._canTransferArrayBuffer = false;
                return TaskProcessor._canTransferArrayBuffer;
            }


            worker.onmessage = function (event) {
                var array = event.data.array;

                var result = isDefined(array) && array[0] === value;
                resolve(result);

                worker.terminate();

                TaskProcessor._canTransferArrayBuffer = result;
            };
        });
    }

    return (window.Worker as any).canTransferArrayBuffer;
}




function getWorkerUrl(moduleID: any) {
    var url = moduleID;

    // if (isCrossOriginUrl(url)) {
    //     //to load cross-origin, create a shim worker from a blob URL
    //     var script = 'importScripts("' + url + '");';

    //     var blob;
    //     try {
    //         blob = new Blob([script], {
    //             type: "application/javascript",
    //         });
    //     } catch (e) {
    //         var BlobBuilder =
    //             (window as any).BlobBuilder ||
    //             (window as any).WebKitBlobBuilder ||
    //             (window as any).MozBlobBuilder ||
    //             (window as any).MSBlobBuilder;
    //         var blobBuilder = new BlobBuilder();
    //         blobBuilder.append(script);
    //         blob = blobBuilder.getBlob("application/javascript");
    //     }

    //     var URL = window.URL || window.webkitURL;
    //     url = URL.createObjectURL(blob);
    // }

    return url;
}


var emptyTransferableObjectArray: any = [];



/**
 * A wrapper around a web worker that allows scheduling tasks for a given worker,
 * returning results asynchronously via a promise.
 *
 * The Worker is not constructed until a task is scheduled.
 *
 * @alias TaskProcessor
 * @constructor
 *
 * @param {String} workerPath The Url to the worker. This can either be an absolute path or relative to the Cesium Workers folder.
 * @param {Number} [maximumActiveTasks=5] The maximum number of active tasks.  Once exceeded,
 *                                        scheduleTask will not queue any more tasks, allowing
 *                                        work to be rescheduled in future frames.
 * 
  * @example
 * encodedVertexBuffer.subarray 可以分段操作内存
 * const taskProcessor = new TaskProcessor("/transferTypedArrayTest1.js");
 * var objData =
 * {
 *     str: "string",
 *     ab: new ArrayBuffer(10),
 *     i8: new Int8Array(10)
 * };
 * objData.i8[0] = 12;
 *
 * const tPromise1 = taskProcessor.scheduleTask(objData, [objData.ab, objData.i8.buffer])
 * if (tPromise1)
 *    tPromise1.then((data) => {
 *        console.log('in app 1');
 *        console.dir(data);
 *    })
 * 
 */
export class TaskProcessor extends EventHandler {
    static _defaultWorkerModulePrefix = "Workers/";
    static _workerModulePrefix = TaskProcessor._defaultWorkerModulePrefix;
    static _canTransferArrayBuffer: boolean = true;

    workerPath: string = '';
    private _maximumActiveTasks: number;
    _activeTasks: number;
    _promises: any = {};
    private _nextID: number;
    private _worker: Undefinable<Worker>
    constructor(workerPath: string, maximumActiveTasks: number = 5) {
        super();
        this.workerPath = TaskProcessor._workerModulePrefix + workerPath;
        this._maximumActiveTasks = maximumActiveTasks;
        this._activeTasks = 0;
        this._promises = {};
        this._nextID = 0;
    }

    createWorker() {
        var worker = new Worker(this.workerPath);
        worker.postMessage = (<Worker | any>worker).webkitPostMessage || worker.postMessage;

        const that = this;
        worker.onmessage = function (event) {
            that.completeTask(event.data);
        };

        return worker;
    }

    completeTask(data: { id: number, error: any, result: any }) {
        //使用完成减一个
        --this._activeTasks;

        var id = data.id;
        if (!isDefined(id)) {
            return;
        }

        var _promises = this._promises;
        var promise = _promises[id];

        if (isDefined(data.error)) {
            var error = data.error;
            // taskCompletedEvent.raiseEvent(error);
            promise.reject(error);
        } else {
            // taskCompletedEvent.raiseEvent();
            promise.resolve(data.result);
        }

        delete _promises[id];
    }


    scheduleTask(parameters: any, transferableObjects: any): Promise<any> | undefined {
        if (!isDefined(this._worker)) {
            this._worker = this.createWorker();
        }

        if (this._activeTasks >= this._maximumActiveTasks) {
            return undefined;
        }

        ++this._activeTasks;

        var that = this;
        return Promise.resolve(canTransferArrayBuffer())
            .then((canTransferArrayBuffer) => {
                if (!isDefined(transferableObjects)) {
                    transferableObjects = emptyTransferableObjectArray;
                } else if (!canTransferArrayBuffer) {
                    transferableObjects.length = 0;
                }

                const id = that._nextID++;
                const deferred = new Defer;
                that._promises[id] = deferred;

                if (that._worker)
                    that._worker.postMessage(
                        {
                            id: id,
                            parameters: parameters,
                            canTransferArrayBuffer: canTransferArrayBuffer,
                        },
                        transferableObjects
                    );

                return deferred.promise;
            });

    }

    isDestroyed() {
        return false;
    };


    /**
     * Destroys this object.  This will immediately terminate the Worker.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     */
    destroy() {
        if (isDefined(this._worker)) {
            this._worker!.terminate();
        }
    };
}

