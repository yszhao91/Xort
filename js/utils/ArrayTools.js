if(Array.prototype.contains === undefined)
	Array.prototype.contains = function(obj) {
		var pos = this.indexOf(obj)
		if(pos === -1)
			return false
		return true;
	}

if(Array.prototype.remove === undefined)
	Array.prototype.remove = function(obj) {
		var pos = this.indexOf(obj)
		if(pos >= 0)
			this.splice(pos, 1);

		return null;
	}

if(Array.prototype.removeAt === undefined)
	Array.prototype.removeAt = function(pos) {
		this.splice(pos, 1);
	}

if(Array.prototype.dc_remove === undefined)
	Array.prototype.dc_remove = function(callback, refobj) {
		for(var i = 0; i < this.length; i++) {
			if(callback(this[i], refobj)) {
				this.removeAt(i);
				i--
			}
		}
	}

if(Array.prototype.replace === undefined)
	Array.prototype.replace = function(pos, obj) {
		var pos = this.indexOf(obj)
		this.splice(pos, 1, obj);

		return null;
	}

if(Array.prototype.insert === undefined)
	Array.prototype.insert = function(pos, obj) {
		this.splice(pos, 0, obj);
	}

if(Array.prototype.insertRange === undefined)
	Array.prototype.insertRange = function(pos, obj) {
		for(var i = obj.length - 1; i >= 0; i--) {
			this.splice(pos, 0, obj[i]);
		}
	}

if(Array.prototype.add === undefined)
	Array.prototype.add = Array.prototype.push;

if(Array.prototype.addRange === undefined)
	Array.prototype.addRange = function(ary) {
		if(ary instanceof Array)
			for(var i = 0; i < ary.length; i++) {
				this.add(ary[i])
			}
		else
			this.push(ary[i])
	}

if(Array.prototype.traverse === undefined)
	Array.prototype.traverse = function(callback) {
		for(var i = 0; i < this.length; i++) {
			callback(this[i], i, this)
		}
	}

if(Array.prototype.classify === undefined)
	Array.prototype.classify = function(method) {
		var datas = [].concat(this);
		var result = [];
		var ones = []
		for(var s = 0; s < datas.length;) {
			ones.add(datas[0])
			datas.removeAt(s);
			for(var i = 0; i < datas.length;) {
				if(method(ones[0], datas[i])) {
					ones.add(datas[i]);
					datas.removeAt(i);
				} else i++;
			}
			result.add(ones)
			ones = [];
		}
		datas = null;
		delete datas;
		return result;
	}

if(Array.prototype.unique === undefined)
	Array.prototype.unique = function(method) {
		for(var s = 0; s < this.length; s++) {
			var refObj = this[s];
			for(var i = s + 1; i < this.length;) {
				if(method(refObj, this[i]))
					this.removeAt(i);
				else i++;
			}
		}
	}

if(Array.prototype.dcfind === undefined)
	Array.prototype.dcfind = function(refobj, method) {
		for(var s = 0; s < this.length; s++) {
			if(method(refobj, this[s]))
				return this[s];
		}
	}