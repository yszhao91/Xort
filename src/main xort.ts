import { XortScene } from "./core/scene";
import { Xort } from "./core/xort";
import { XortEntity } from './core/entity';
import { GeometryComponent } from './core/component/geometry';

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const xort = new Xort(canvas);

(window as any).xort = xort;

const scene = new XortScene();
const enitity = new XortEntity();
enitity.addComponent(new GeometryComponent());
scene.add(enitity);
xort.scene = scene;
await xort.start();
xort._vision.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    xort._vision.setSize(width, height);

})

xort.loop();

