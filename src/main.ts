import { XortScene } from "./core/scene";
import { Xort } from "./core/xort";
import { XortEntity } from './core/entity';
import { GeometryComponent } from './core/component/geometry';
import { GeometryData } from "./ecs/data/geometry";
import { MaterialComponent } from "./core/component/material";
import { MaterialData } from "./ecs/data/material";
import { World } from "@xort/of";

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const xort = new Xort(canvas);

(window as any).xort = xort;

const world = new World({editor:xort})

const scene = new XortScene(xort);
const enitity = new XortEntity(xort);
const geocom = new GeometryComponent();
geocom._asset = GeometryData.planeGeometry();
enitity.addComponent(geocom);
const matcom = new MaterialComponent();
matcom._asset = new MaterialData();
enitity.addComponent(matcom);
scene.add(enitity);
xort.scene = scene;
await xort.start();
xort._vision.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    xort._vision.setSize(width, height);

});

xort.loop();

