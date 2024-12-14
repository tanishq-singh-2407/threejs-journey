import "./style.css";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

/**
 * Constants
 */
var PARAMS = {
	camera: {
		x: 0,
		y: 0,
		z: 6,
	},
	objects: {
		color: "#ffeded",
		distance: 4,
		rotation: {
			x: 0.1,
			y: 0.12,
			z: 0,
		},
	},
	cursor: {
		x: 0,
		y: 0,
	},
	particles: {
		count: 2000,
		size: 0.03,
	},
};

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl")!;
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const pane = new Pane();

/**
 * Objects
 */
const texture = textureLoader.load("/3.jpg");
texture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshToonMaterial({
	color: PARAMS.objects.color,
	gradientMap: texture,
});

const obj1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const obj2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const obj3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material);

const objects = [obj1, obj2, obj3];

objects[0].position.y = -PARAMS.objects.distance * 0;
objects[1].position.y = -PARAMS.objects.distance * 1;
objects[2].position.y = -PARAMS.objects.distance * 2;

objects[0].position.x = 2;
objects[1].position.x = -2;
objects[2].position.x = 2;

scene.add(...objects);

/**
 * Particles
 */
let geometry: THREE.BufferGeometry | null;
let pointsMaterial: THREE.PointsMaterial | null;
let particles: THREE.Points | null;

const createParticles = () => {
	if (particles !== null) {
		geometry?.dispose();
		pointsMaterial?.dispose();
		scene.remove(particles);
	}

	const positions = new Float32Array(PARAMS.particles.count * 3);
	for (var i = 0; i < PARAMS.particles.count; i++) {
		positions[3 * i + 0] = (Math.random() - 0.5) * 10.0;
		positions[3 * i + 1] = (Math.random() - 0.75) * Math.pow(PARAMS.objects.distance, 2);
		positions[3 * i + 2] = (Math.random() - 0.5) * 10.0;
	}
	geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

	pointsMaterial = new THREE.PointsMaterial({
		size: PARAMS.particles.size,
		sizeAttenuation: true,
		color: PARAMS.objects.color,
	});

	particles = new THREE.Points(geometry, pointsMaterial);
	scene.add(particles);
};

/**
 * Light
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 6);

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

/**
 * Orbit Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * Debug Object
 */
const cameraDebugObject = pane.addFolder({ title: "camera", expanded: false });
cameraDebugObject.addBinding(PARAMS.camera, "x", { min: -30, max: 30, step: 0.01 }).on("change", ({ value }) => (camera.position.x = value));
cameraDebugObject.addBinding(PARAMS.camera, "y", { min: -30, max: 30, step: 0.01 }).on("change", ({ value }) => (camera.position.y = value));
cameraDebugObject.addBinding(PARAMS.camera, "z", { min: -30, max: 30, step: 0.01 }).on("change", ({ value }) => (camera.position.z = value));

const objectDebugObject = pane.addFolder({ title: "objects", expanded: false });
objectDebugObject.addBinding(PARAMS.objects, "color").on("change", ({ value }) => {
	material.color = new THREE.Color(value);
	pointsMaterial!.color = new THREE.Color(value);
});

const objectRotationDebugObject = objectDebugObject.addFolder({ title: "rotation", expanded: false });
objectRotationDebugObject.addBinding(PARAMS.objects.rotation, "x", { min: -5, max: 5, step: 0.01 });
objectRotationDebugObject.addBinding(PARAMS.objects.rotation, "y", { min: -5, max: 5, step: 0.01 });
objectRotationDebugObject.addBinding(PARAMS.objects.rotation, "z", { min: -5, max: 5, step: 0.01 });

const particlesDebugObjct = pane.addFolder({ title: "particles", expanded: false });
particlesDebugObjct.addBinding(PARAMS.particles, "count", { min: 1000, max: 200000, step: 500 }).on("change", createParticles);
particlesDebugObjct.addBinding(PARAMS.particles, "size", { min: 0.01, max: 0.1, step: 0.01 }).on("change", ({ value }) => (pointsMaterial!.size = value));

/**
 * Others
 */
const clock = new THREE.Clock();
window.onresize = () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.onmousemove = (e) => {
	PARAMS.cursor.x = e.clientX / sizes.width - 0.5;
	PARAMS.cursor.y = e.clientY / sizes.height - 0.5;
};

let currentSection = 0;
window.onscroll = () => {
	const newSession = Math.round(window.scrollY / sizes.height);

	if (newSession !== currentSection) {
		currentSection = newSession;

		gsap.to(objects[currentSection].rotation, { duration: 1.5, ease: "power2.inOut", x: "+=6", y: "+=3" });
	}
};

/**
 * Frame Animation
 */
let previousTime = 0;
const Animation = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	camera.position.y = (-window.scrollY / sizes.height) * PARAMS.objects.distance;
	cameraGroup.position.x += (PARAMS.cursor.x - cameraGroup.position.x) * 0.1;
	cameraGroup.position.y += (-PARAMS.cursor.y - cameraGroup.position.y) * 0.1;

	for (const object of objects) {
		object.rotation.x += deltaTime * PARAMS.objects.rotation.x;
		object.rotation.y += deltaTime * PARAMS.objects.rotation.y;
		object.rotation.y += deltaTime * PARAMS.objects.rotation.z;
	}

	renderer.render(scene, camera);

	requestAnimationFrame(Animation);
};

createParticles();
Animation();
