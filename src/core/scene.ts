import { Color } from '../cga';
import { Xort } from './xort';
import { XortEntity } from './entity';
import { IStringDictionary } from '../cga/utils/types';
import { CameraComponent } from './component/camera';
export class XortScene extends XortEntity {
    _camera: XortEntity;
    background: Color = new Color(0.5, 0.5, 0.6);
    depthTexture: any;
    depth: boolean = true;
    _items: IStringDictionary<XortEntity> = {};
    opaque: XortEntity[] = [];
    transparent: XortEntity[] = [];

    readonly isXortScene: boolean = true;
    constructor(xort: Xort) {
        super(xort)

        if (this.depth) {
        }

        this.xort.on('nextStepEntity', (entity: XortEntity) => {
            if ((entity as any).isXortScene)
                return;
            if (entity.material) {
                if ( entity.material  ._asset.transparent)
                    this.transparent.push(entity);
                else
                    this.opaque.push(entity);
            }
        });

        this._camera = new XortEntity(xort);
        this._camera.addComponent(new CameraComponent());

        this.add(this._camera);
    }

    set camera(val: XortEntity) {
        this.remove(this._camera);
        this.add(val);
        this._camera = val;
    }

    get camera() {
        return this._camera;
    }

    nextStep(xort: Xort): void {
        this.transfrom.updateMatWorld();

        this.opaque = [];
        this.transparent = [];
        super.nextStep(xort);
    }


}