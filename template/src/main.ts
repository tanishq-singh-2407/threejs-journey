import "./style.css";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

var PARAMS = {
	rotation: {
		x: 0.4,
		y: 0.3,
		z: 0.2,
	},
};

const canvas = document.querySelector("canvas.webgl")!;
const scene = new THREE.Scene();
const pane = new Pane();

const box = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: 0xff88cc, wireframe: true })
);
scene.add(box);
pane.addBinding(box.material, "wireframe");
pane.addBinding(PARAMS.rotation, "x", { min: 0, max: 20, step: 0.1 });
pane.addBinding(PARAMS.rotation, "y", { min: 0, max: 20, step: 0.1 });
pane.addBinding(PARAMS.rotation, "z", { min: 0, max: 20, step: 0.1 });

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.onresize = () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;

	camera.updateProjectionMatrix();
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

const clock = new THREE.Clock();

const Animation = () => {
	const elapsedTime = clock.getElapsedTime();
	box.rotation.y = elapsedTime * PARAMS.rotation.x;
	box.rotation.x = elapsedTime * PARAMS.rotation.y;
	box.rotation.z = elapsedTime * PARAMS.rotation.z;

	renderer.render(scene, camera);
	controls.update();

	requestAnimationFrame(Animation);
};

Animation();