import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Added .js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Added .js

@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  templateUrl: './three-d-viewer.html',
  styleUrls: ['./three-d-viewer.scss']
})
export class ThreeDViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  model!: THREE.Group; // To hold the loaded GLTF model
  controls!: OrbitControls; // OrbitControls for interactivity

  constructor() { }

  ngOnInit(): void {
    // Keep this empty for now, or add non-view-dependent initialization
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.setupControls();
    this.loadModel();
    this.animate();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.controls) {
      this.controls.dispose();
    }
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Updated for newer Three.js versions
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Lighting for GLTF models
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    this.scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 20, 10);
    this.scene.add(directionalLight);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Enable inertia for smoother controls
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false; // Prevents panning beyond limits
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500; // Adjust based on model size
    this.controls.maxPolarAngle = Math.PI / 2; // Prevents camera from going below ground
  }

  loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/island/scene.gltf', // Path to your GLTF model
      (gltf: GLTF) => { // Explicitly type gltf
        this.model = gltf.scene;
        this.scene.add(this.model);

        // Fit camera to the loaded model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some buffer

        this.camera.position.set(center.x, center.y + (maxDim / 4), cameraZ); // Position camera above and slightly back
        this.camera.lookAt(center);

        this.controls.target.copy(center); // Set orbit controls target to model center
        this.controls.update();
      },
      (xhr: ProgressEvent) => { // Explicitly type xhr
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error: unknown) => { // Explicitly type error as unknown
        console.error('Error loading GLTF model', error);
      }
    );
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update(); // Only update controls, remove mesh rotation
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
