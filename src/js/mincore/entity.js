export class Entity {
    constructor(name, app) {
        super({ name });
        this._batchHandle = null; // The handle for a RequestBatch, set this if you want to Component's to load their resources using a pre-existing RequestBatch.
        this._components = []; // Component storage
        this._comdic = {}; // Component storage

        this._app = app || xr; // store app 
        this._renderObject = new Object3D();
        this._data = {
            mesh: null,
            geometry: null,
            material: null,
            sprite: null,
            camera: null,
        };
        this._needsCompile = true;

        this.addComponent(new TransfromComponent(this));
        this.createTime = Date.now();
    }

    add(entity) {
        super.add(entity);
        entity.compile();
    }

    compile() {
        if (this._needsCompile)
        {
            var data = this._data;
            for (let i = 0; i < this._components.length; i++)
            {
                const c = this._components[i];
                switch (c)
                {
                    case GeometryComponent:
                        if (!data.geometry)
                            data.geometry = c;
                        break;
                    case MaterialComponent:
                        if (!data.material)
                            data.material = c;
                        break;
                    case CameraComponent:
                        if (!data.camera)
                            data.camera = c;
                        break;
                    case LightComponent:
                        if (!data.light)
                            data.light = c;
                        break;
                    case ScriptComponent:
                        if (!data.light)
                            data.light = c;
                        break;
                    // case PostProcessingComponent:

                    //     break;
                    // case BoundingBoxComponent:
                    //     //物理

                    //     break;
                    // case PhysicalMaterialComponent:
                    //     //物理

                    //     break;
                    // case AnimationComponent:
                    //     //动画

                    //     break;
                }
            }

            if (!data.mesh && data.geometry)
            {
                data.mesh = new Mesh(data.geometry._renderObject, data.material || defaultMaterial);
                this._renderObject.add(data.mesh);
            }
            this._needsCompile = false;
        }

        if (this.parent && !this._renderObject.parent)
            this.parent._renderObject.add(this._renderObject);

        for (let i = 0; i < this.children.length; i++)
        {
            const childEntity = this.children[i];
            childEntity.compile()
        }
    }

    addComponent(component) {
        if (this._components.indexOf(component) !== -1)
            return false;
        this._components.push(component);
        component.entity = this;

        this._needsCompile = true;
        component._entity = this;
        this.compile();
    }

    addComponentEx(type, data) {
        var system = this._app.systems[type];
        if (!system)
        {
            // #ifdef DEBUG
            console.error("addComponent: System " + type + " doesn't exist");
            // #endif
            return null;
        }
        if (this.c[type])
        {
            // #ifdef DEBUG
            console.warn("addComponent: Entity already has " + type + " component");
            // #endif
            return null;
        }
        return this.addComponent(this, data);
    }

    removeComponent(type) {
        var system = this._app.systems[type];
        if (!system)
        {
            // #ifdef DEBUG
            console.error("removeComponent: System " + type + " doesn't exist");
            // #endif
            return;
        }
        if (!this.c[type])
        {
            ;
            // #ifdef DEBUG
            console.warn("removeComponent: Entity doesn't have " + type + " component");
            // #endif
            return;
        }
        component._entity = null;
        system.removeComponent(this);
    }

    findComponent(type) {
        var entity = this.findOne(function (node) {
            return node.c && node.c[type];
        });
        return entity && entity.c[type];
    }


    findComponents(type) {
        var entities = this.find(function (node) {
            return node.c && node.c[type];
        });
        return entities.map(function (entity) {
            return entity.c[type];
        });
    }


    get guid() {
        return this.uuid;
    }


    set guid(guid) {
        // remove current guid from entityIndex
        var index = this._app._entityIndex;
        if (this.uuid)
        {
            delete index[this.uuid];
        }

        // add new guid to entityIndex
        this.uuid = guid;
        index[this.uuid] = this;
    }

    _notifyHierarchyStateChanged(node, enabled) {
        var enableFirst = false;
        if (node === this && this._app._enableList.length === 0)
            enableFirst = true;

        node._beingEnabled = true;

        node._onHierarchyStateChanged(enabled);

        if (node._onHierarchyStatePostChanged)
            this._app._enableList.push(node);

        var i, len;
        var c = node._children;
        for (i = 0, len = c.length; i < len; i++)
        {
            if (c[i]._enabled)
                this._notifyHierarchyStateChanged(c[i], enabled);
        }

        node._beingEnabled = false;

        if (enableFirst)
        {
            // do not cache the length here, as enableList may be added to during loop
            for (i = 0; i < this._app._enableList.length; i++)
            {
                this._app._enableList[i]._onHierarchyStatePostChanged();
            }

            this._app._enableList.length = 0;
        }
    }

    _onHierarchyStateChanged(enabled) {
        pc.GraphNode.prototype._onHierarchyStateChanged.call(this, enabled);

        // enable / disable all the components
        var component;
        var components = this.c;
        for (var type in components)
        {
            if (components.hasOwnProperty(type))
            {
                component = components[type];
                if (component.enabled)
                {
                    if (enabled)
                    {
                        component.onEnable();
                    } else
                    {
                        component.onDisable();
                    }
                }
            }
        }
    }

    _onHierarchyStatePostChanged() {
        // post enable all the components
        var components = this.c;
        for (var type in components)
        {
            if (components.hasOwnProperty(type))
                components[type].onPostStateChange();
        }
    }

    /**
     * @function
     * @name pc.Entity#findByGuid
     * @description Find a descendant of this Entity with the GUID.
     * @param {string} guid - The GUID to search for.
     * @returns {pc.Entity} The Entity with the GUID or null.
     */
    findByGuid(guid) {
        if (this._guid === guid) return this;

        var e = this._app._entityIndex[guid];
        if (e && (e === this || e.isDescendantOf(this)))
        {
            return e;
        }

        return null;
    }

    /**
     * @function
     * @name pc.Entity#destroy
     * @description Remove all components from the Entity and detach it from the Entity hierarchy. Then recursively destroy all ancestor Entities.
     * @example
     * var firstChild = this.entity.children[0];
     * firstChild.destroy(); // delete child, all components and remove from hierarchy
     */
    destroy() {
        var name;

        this._destroying = true;

        // Disable all enabled components first
        for (name in this.c)
        {
            this.c[name].enabled = false;
        }

        // Remove all components
        for (name in this.c)
        {
            this.c[name].system.removeComponent(this);
        }

        // Detach from parent
        if (this._parent)
            this._parent.removeChild(this);

        var children = this._children;
        var child = children.shift();
        while (child)
        {
            if (child instanceof pc.Entity)
            {
                child.destroy();
            }

            // make sure child._parent is null because
            // we have removed it from the children array before calling
            // destroy on it
            child._parent = null;

            child = children.shift();
        }

        // fire destroy event
        this.fire('destroy', this);

        // clear all events
        this.off();

        // remove from entity index
        if (this._guid)
        {
            delete this._app._entityIndex[this._guid];
        }

        this._destroying = false;
    }

    /**
     * @function
     * @name pc.Entity#clone
     * @description Create a deep copy of the Entity. Duplicate the full Entity hierarchy, with all Components and all descendants.
     * Note, this Entity is not in the hierarchy and must be added manually.
     * @returns {pc.Entity} A new Entity which is a deep copy of the original.
     * @example
     * var e = this.entity.clone();
     *
     * // Add clone as a sibling to the original
     * this.entity.parent.addChild(e);
     */
    clone() {
        var duplicatedIdsMap = {};
        var clone = this._cloneRecursively(duplicatedIdsMap);
        duplicatedIdsMap[this.getGuid()] = clone;

        resolveDuplicatedEntityReferenceProperties(this, this, clone, duplicatedIdsMap);

        return clone;
    }

    _cloneRecursively(duplicatedIdsMap) {
        var clone = new pc.Entity(this._app);
        pc.GraphNode.prototype._cloneInternal.call(this, clone);

        for (var type in this.c)
        {
            var component = this.c[type];
            component.system.cloneComponent(this, clone);
        }

        var i;
        for (i = 0; i < this._children.length; i++)
        {
            var oldChild = this._children[i];
            if (oldChild instanceof pc.Entity)
            {
                var newChild = oldChild._cloneRecursively(duplicatedIdsMap);
                clone.addChild(newChild);
                duplicatedIdsMap[oldChild.getGuid()] = newChild;
            }
        }

        return clone;
    }
}