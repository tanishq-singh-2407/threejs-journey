import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import galaxyVertexShader from "./shaders/galaxy/vertex.ts";
import galaxyFragmentShader from "./shaders/galaxy/fragment.ts";

// Canvas
const canvas = document.querySelector("canvas.webgl")!;
const scene = new THREE.Scene();
const pane = new Pane();

var PARAMS = {
	particles: {
		count: 200000,
		size: 25,
	},
	galaxy: {
		radius: 5,
		branches: 3,
		randomPow: 3,
		randomness: 0.5,
		innerColor: "#dd947e",
		outerColor: "#1b3984",
		speed: 0.2,
	},
	sizes: {
		width: window.innerWidth,
		height: window.innerHeight,
	},
};

/**
 * Galaxy
 */
let geometry: THREE.BufferGeometry | null = null;
let material: THREE.ShaderMaterial | null = null;
let points: THREE.Points | null = null;

const generateGalaxy = () => {
	if (points !== null) {
		geometry!.dispose();
		material!.dispose();
		scene.remove(points);
	}

	/**
	 * Geometry & Material
	 */
	geometry = new THREE.BufferGeometry();
	material = new THREE.ShaderMaterial({
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
		vertexShader: galaxyVertexShader,
		fragmentShader: galaxyFragmentShader,
		uniforms: {
			u_time: { value: 0 },
			u_speed: { value: PARAMS.galaxy.speed },
		},
	});

	const positions = new Float32Array(PARAMS.particles.count * 3);
	const randomness = new Float32Array(PARAMS.particles.count * 3);
	const colors = new Float32Array(PARAMS.particles.count * 3);
	const scales = new Float32Array(PARAMS.particles.count * 1);

	const insideColor = new THREE.Color(PARAMS.galaxy.innerColor);
	const outsideColor = new THREE.Color(PARAMS.galaxy.outerColor);

	for (let i = 0; i < PARAMS.particles.count; i++) {
		const i3 = i * 3;

		// Scale
		scales[i] = Math.random() * PARAMS.particles.size * renderer.getPixelRatio();

		// Position
		const radius = Math.random() * PARAMS.galaxy.radius;
		const branchAngle = ((i % PARAMS.galaxy.branches) / PARAMS.galaxy.branches) * Math.PI * 2;

		positions[i3 + 0] = Math.cos(branchAngle) * radius;
		positions[i3 + 1] = 0.0;
		positions[i3 + 2] = Math.sin(branchAngle) * radius;

		// Randomness
		randomness[i3 + 0] = Math.pow(Math.random(), PARAMS.galaxy.randomPow) * (Math.random() < 0.5 ? 1 : -1) * PARAMS.galaxy.randomness * radius;
		randomness[i3 + 1] = Math.pow(Math.random(), PARAMS.galaxy.randomPow) * (Math.random() < 0.5 ? 1 : -1) * PARAMS.galaxy.randomness * radius;
		randomness[i3 + 2] = Math.pow(Math.random(), PARAMS.galaxy.randomPow) * (Math.random() < 0.5 ? 1 : -1) * PARAMS.galaxy.randomness * radius;

		// Color
		const mixedColor = insideColor.clone();
		mixedColor.lerp(outsideColor, radius / PARAMS.galaxy.radius);

		colors[i3 + 0] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("a_randomness", new THREE.BufferAttribute(randomness, 3));
	geometry.setAttribute("a_scale", new THREE.BufferAttribute(scales, 1));
	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

	/**
	 * Points
	 */
	points = new THREE.Points(geometry, material);
	scene.add(points);
};

// /**
//  * Debug Objects
//  */
const debugPanel = pane.addFolder({ title: "Debug Panel", expanded: false });

const particlesDebugFolder = debugPanel.addFolder({ title: "Particles", expanded: false });
particlesDebugFolder.addBinding(PARAMS.particles, "count", { min: 10000, max: 400000, step: 10000 }).on("change", generateGalaxy);
particlesDebugFolder.addBinding(PARAMS.particles, "size", { min: 1, max: 50, step: 0.5 }).on("change", generateGalaxy);

const galaxyDebugFolder = debugPanel.addFolder({ title: "Galaxy", expanded: false });
galaxyDebugFolder.addBinding(PARAMS.galaxy, "branches", { min: 1, max: 20, step: 1 }).on("change", generateGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "radius", { min: 1, max: 100, step: 1 }).on("change", generateGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "speed", { min: -1, max: 1, step: 0.1 }).on("change", generateGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "randomPow", { min: -10, max: 10, step: 0.01 }).on("change", generateGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "randomness", { min: 0.01, max: 5, step: 0.001 }).on("change", generateGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "innerColor").on("change", generateGalaxy);
galaxyDebugFolder.addBinding(PARAMS.galaxy, "outerColor").on("change", generateGalaxy);

debugPanel.addButton({ title: "tanishq singh", label: "creater" }).on("click", () => window.open("https://tanishqsingh.com"));

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, PARAMS.sizes.width / PARAMS.sizes.height, 0.1, 100);
camera.position.set(3, 3, 3);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(PARAMS.sizes.width, PARAMS.sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Orbit Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener("resize", () => {
	// Update Size
	PARAMS.sizes.width = window.innerWidth;
	PARAMS.sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = PARAMS.sizes.width / PARAMS.sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(PARAMS.sizes.width, PARAMS.sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const animation = () => {
	if (!material) return;

	const elapsedTime = clock.getElapsedTime();

	material.uniforms.u_time.value = elapsedTime;
	// points.rotation.y = -elapsedTime * PARAMS.galaxy.rotate;

	// Update controls & Renderer
	controls.update();
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(animation);
};

generateGalaxy();
animation();
