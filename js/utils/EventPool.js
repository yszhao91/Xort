Dc.EventPool = function () {
    this._listeners = [];
    this.add = function (listener) {
        if (this._listeners === undefined)
            this._listeners = [];

        var listeners = this._listeners;

        if (listeners.indexOf(listeners) === -1)
            listeners.push(listener)

    this.remove = function (listener) {
        if (this._listeners === undefined)
            return;

        var listeners = this._listeners;

        var index = listeners.indexOf(listener);

        if (index !== -1) {
            listeners.splice(index, 1);
        }

    };
    this.dispatch = function (args) {
        if (this._listeners === undefined)
            return;

        var listeners = this._listeners;

        var array = [],
			i = 0;

        var length = listeners.length;

        for (var i = 0; i < length; i++) {
            array[i] = listeners[i];
        }

        for (var i = 0; i < length; i++) {
            array[i].call(this, args);
        }
    };

}; 