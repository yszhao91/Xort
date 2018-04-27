//节点管理
function ObjNode() {
	var self = this;
	this.uuid = Cm.uuid();
	this.type = "ObjNode";
	this.name = "ObjNode";
	this.parent = null;
	this.children = [];
}

ObjNode.prototype = {
	add: function(object) {
		if(arguments.length > 1) {
			for(var i = 0; i < arguments.length; i++) {
				this.add(arguments[i]);
			}
			return this;
		}

		if(object === this) {
			console.error(
				" Obj3D.add: object can't be added as a child of itself.",
				object
			);
			return this;
		}

		if(object && object.isObj3D) {
			if(object.parent !== null) {
				object.parent.remove(object);
			}

			object.parent = this;
			//			object.dispatchEvent({
			//				type: 'added'
			//			});

			this.children.push(object);
		} else {
			console.error(" Obj3D.add: object not an instance of  Obj3D.", object);
		}

		return this;
	},

	remove: function(object) {
		if(arguments.length > 1) {
			for(var i = 0; i < arguments.length; i++) {
				this.remove(arguments[i]);
			}

			return this;
		}

		var index = this.children.indexOf(object);

		if(index !== -1) {
			object.parent = null;

			//			object.dispatchEvent({
			//				type: "removed"
			//			});

			this.children.splice(index, 1);
		}

		return this;
	},

	getObjById: function(id) {
		return this.getObjByProperty("id", id);
	},

	getObjByName: function(name) {
		return this.getObjByProperty("name", name);
	},

	getObjByProperty: function(name, value) {
		if(this[name] === value) return this;

		for(var i = 0, l = this.children.length; i < l; i++) {
			var child = this.children[i];
			var object = child.getObjByProperty(name, value);

			if(object !== undefined) {
				return object;
			}
		}

		return undefined;
	}
};