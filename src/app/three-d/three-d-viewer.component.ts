import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  templateUrl: './three-d-viewer.html',
  styleUrls: ['./three-d-viewer.scss']
})
export class ThreeDViewerComponent implements OnInit, OnDestroy, AfterViewInit { // Add AfterViewInit
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  mesh!: THREE.Mesh;

  constructor() { }

  ngOnInit(): void {
    // Keep this empty for now, or add non-view-dependent initialization
  }

  ngAfterViewInit(): void { // New lifecycle hook
    this.initScene();
    this.createTorus();
    this.animate();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Transparent background

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.camera.position.z = 5;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createTorus(): void {
    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Changed to Phong material for lighting
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
