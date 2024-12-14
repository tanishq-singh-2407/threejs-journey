import "./style.css";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

var PARAMS = {
	particles: {
		count: 120000,
		size: 0.01,
	},
	galaxy: {
		radius: 7,
		branches: 3,
		spin: 3.5,
		randomPow: 1.8,
		randomness: 0.281,
		innerColor: "#5b2616",
		outerColor: "#1b3984",
		rotate: 0.02,
	},
};

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl")!;
const scene = new THREE.Scene();
const pane = new Pane();

/**
 * Galaxy
 */
let geometry: THREE.BufferGeometry | null;
let material: THREE.PointsMaterial | null;
let particles: THREE.Points | null;

const createGalaxy = () => {
	if (particles !== null) {
		geometry?.dispose();
		material?.dispose();
		scene.remove(particles);
	}

	geometry = new THREE.BufferGeometry();
	material = new THREE.PointsMaterial({
		size: PARAMS.particles.size,
		sizeAttenuation: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	// position attribute
	const positions = new Float32Array(PARAMS.particles.count * 3); // 1 point will have x, y, z position in space
	const colors = new Float32Array(PARAMS.particles.count * 3); // 1 point will have r, g, b vales

	const innerColor = new THREE.Color(PARAMS.galaxy.innerColor);
	const outerColor = new THREE.Color(PARAMS.galaxy.outerColor);

	for (var i = 0; i < PARAMS.particles.count; ++i) {
		const radius = Math.random() * PARAMS.galaxy.radius;

		const branchAngle = ((i % PARAMS.galaxy.branches) / PARAMS.galaxy.branches) * Math.PI * 2;
		const spinAngle = radius * PARAMS.galaxy.spin;

		const random = {
			x: Math.pow(Math.random(), PARAMS.galaxy.randomPow) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.galaxy.randomness,
			y: Math.pow(Math.random(), PARAMS.galaxy.randomPow) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.galaxy.randomness,
			z: Math.pow(Math.random(), PARAMS.galaxy.randomPow) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.galaxy.randomness,
		};

		positions[3 * i + 0] = Math.cos(branchAngle + spinAngle) * radius + random.x;
		positions[3 * i + 1] = random.y;
		positions[3 * i + 2] = Math.sin(branchAngle + spinAngle) * radius + random.z;

		const mixedColor = innerColor.clone().lerp(outerColor, radius / PARAMS.galaxy.radius);

		colors[3 * i + 0] = mixedColor.r;
		colors[3 * i + 2] = mixedColor.g;
		colors[3 * i + 3] = mixedColor.b;
	}
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

	particles = new THREE.Points(geometry, material);
	scene.add(particles);
};

/**
 * Debug Objects
 */
const particlesDebugFolder = pane.addFolder({ title: "Particles" });
particlesDebugFolder.addBinding(PARAMS.particles, "count", { min: 10000, max: 200000, step: 500 }).on("change", createGalaxy);
particlesDebugFolder.addBinding(PARAMS.particles, "size", { min: 0.01, max: 1, step: 0.001 }).on("change", createGalaxy);

const galaxyDebugFolder = pane.addFolder({ title: "Galaxy" });
galaxyDebugFolder.addBinding(PARAMS.galaxy, "branches", { min: 2, max: 20, step: 1 }).on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "radius", { min: 1, max: 100, step: 1 }).on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "spin", { min: -5, max: 5, step: 0.01 }).on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "randomPow", { min: 0, max: 10, step: 0.01 }).on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "randomness", { min: 0.01, max: 5, step: 0.001 }).on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "rotate", { min: -5, max: 5, step: 0.001 }).on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "innerColor").on("change", createGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "outerColor").on("change", createGalaxy);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(3, 5, 3);
camera.lookAt(0, 0, -2);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

/**
 * Orbit-Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new THREE.Clock();
window.onresize = () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;

	camera.updateProjectionMatrix();
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

const Animation = () => {
	if (!particles) return;

	const elapsedTime = clock.getElapsedTime();

	particles.rotation.y = -elapsedTime * PARAMS.galaxy.rotate;

	renderer.render(scene, camera);
	controls.update();

	requestAnimationFrame(Animation);
};

createGalaxy();
Animation();
