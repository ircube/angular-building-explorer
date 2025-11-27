import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
// import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js'; // New import for mobile controls
// import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';
@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-d-viewer.html',
  styleUrls: ['./three-d-viewer.scss']
})
export class ThreeDViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  @ViewChild('blockerElement') blockerElement!: ElementRef;
  @ViewChild('joystickLeft') joystickLeft!: ElementRef; // New: ViewChild for virtual joystick
  @ViewChild('joystickRight') joystickRight!: ElementRef; // New: ViewChild for virtual joystick

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  model!: THREE.Group;

  // Conditional controls
  pointerLockControls!: PointerLockControls;
  isMobile: boolean = false;

  // Movement state for both types of controls
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  canJump = false;

  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();
  prevTime = performance.now();
  currentMoveSpeedFactor: number = 0;

  // Joystick state (for mobile)
  joystickLeftPos = { x: 0, y: 0 };
  joystickRightPos = { x: 0, y: 0 }; // Right joystick for camera look (if not using device orientation)

  constructor() { }

  ngOnInit(): void {
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.loadModel(); // Load model regardless of controls

    if (this.isMobile) {
      this.setupTouchControls();
    } else {
      this.setupPointerLockControls();
      this.setupEventListeners(); // Only desktop uses keyboard events
    }
    this.animate();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    if (!this.isMobile) {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
    } else {
      // Remove touch event listeners if added
      // Example: this.joystickLeft.nativeElement.removeEventListener(...)
    }
    // PointerLockControls does not have a dispose method like OrbitControls
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaaaaa);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(0, 50, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    this.scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-50, 100, -100);
    this.scene.add(fillLight);

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupPointerLockControls(): void {
    this.pointerLockControls = new PointerLockControls(this.camera, this.renderer.domElement);
    this.scene.add(this.camera);

    const blocker = this.blockerElement.nativeElement;
    const instructions = blocker.querySelector('.instructions');

    blocker.addEventListener('click', () => {
      this.pointerLockControls.lock();
    });

    this.pointerLockControls.addEventListener('lock', () => {
      if (instructions) instructions.style.display = 'none';
      blocker.style.display = 'none';
    });

    this.pointerLockControls.addEventListener('unlock', () => {
      if (instructions) instructions.style.display = 'block';
      blocker.style.display = 'flex';
    });
  }

  setupTouchControls(): void {
    // Hide blocker on mobile since pointer lock isn't used
    if (this.blockerElement) {
      this.blockerElement.nativeElement.style.display = 'none';
    }

    // Virtual Joystick logic
    if (this.joystickLeft && this.joystickRight) {
      const joystickLeftEl = this.joystickLeft.nativeElement;
      const joystickLeftHandleEl = joystickLeftEl.querySelector('.joystick-handle') as HTMLElement; // Get handle
      const joystickRightEl = this.joystickRight.nativeElement; // Keeping this for potential future use or camera look

      // Left joystick for movement
      let leftActiveTouchId: number | null = null; // Track active touch for left joystick

      joystickLeftEl.addEventListener('touchstart', (event: TouchEvent) => {
        event.preventDefault(); // Prevent default browser actions like scrolling
        if (leftActiveTouchId !== null) return; // Only process if no active touch on left joystick

        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];
          const rect = joystickLeftEl.getBoundingClientRect();
          if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
              touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            leftActiveTouchId = touch.identifier;
            
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            this.joystickLeftPos.x = (touch.clientX - centerX) / (rect.width / 2);
            this.joystickLeftPos.y = (touch.clientY - centerY) / (rect.height / 2);

            // Limit handle movement within joystick bounds
            const maxDistance = rect.width / 2;
            const distance = Math.min(maxDistance, Math.sqrt(
              Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2)
            ));
            const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
            const handleX = Math.cos(angle) * distance;
            const handleY = Math.sin(angle) * distance;

            if (joystickLeftHandleEl) {
              joystickLeftHandleEl.style.transform = `translate3d(${handleX}px, ${handleY}px, 0)`;
            }
            this.updateMovementFromJoystick(this.joystickLeftPos);
            break; // Process only the first relevant touch
          }
        }
      }, { passive: false });

      joystickLeftEl.addEventListener('touchmove', (event: TouchEvent) => {
        event.preventDefault();
        if (leftActiveTouchId === null) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];
          if (touch.identifier === leftActiveTouchId) {
            const rect = joystickLeftEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            this.joystickLeftPos.x = (touch.clientX - centerX) / (rect.width / 2);
            this.joystickLeftPos.y = (touch.clientY - centerY) / (rect.height / 2);

            // Limit handle movement within joystick bounds
            const maxDistance = rect.width / 2;
            const distance = Math.min(maxDistance, Math.sqrt(
              Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2)
            ));
            const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
            const handleX = Math.cos(angle) * distance;
            const handleY = Math.sin(angle) * distance;

            if (joystickLeftHandleEl) {
              joystickLeftHandleEl.style.transform = `translate3d(${handleX}px, ${handleY}px, 0)`;
            }
            this.updateMovementFromJoystick(this.joystickLeftPos);
            break;
          }
        }
      }, { passive: false });

      joystickLeftEl.addEventListener('touchend', (event: TouchEvent) => {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];
          if (touch.identifier === leftActiveTouchId) {
            leftActiveTouchId = null;
            this.joystickLeftPos.x = 0;
            this.joystickLeftPos.y = 0;
            if (joystickLeftHandleEl) {
              joystickLeftHandleEl.style.transform = `translate3d(0px, 0px, 0)`; // Reset handle position
            }
            this.updateMovementFromJoystick(this.joystickLeftPos);
            break;
          }
        }
      });

      // Right joystick for looking around
      const joystickRightHandleEl = joystickRightEl.querySelector('.joystick-handle') as HTMLElement; // Get handle
      let rightActiveTouchId: number | null = null; // Track active touch for right joystick
      let previousTouchX: number;
      let previousTouchY: number;

      if (joystickRightHandleEl) { // Added check
        joystickRightEl.addEventListener('touchstart', (event: TouchEvent) => {
            event.preventDefault();
            if (rightActiveTouchId !== null) return; // Only process if no active touch on right joystick

            for (let i = 0; i < event.changedTouches.length; i++) {
              const touch = event.changedTouches[i];
              const rect = joystickRightEl.getBoundingClientRect();
              if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                  touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                rightActiveTouchId = touch.identifier;
                
                previousTouchX = touch.clientX;
                previousTouchY = touch.clientY;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const currentX = touch.clientX - centerX;
                const currentY = touch.clientY - centerY;

                if (joystickRightHandleEl) {
                    joystickRightHandleEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
                break; // Process only the first relevant touch
              }
            }
        }, { passive: false });

        joystickRightEl.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();
            if (rightActiveTouchId === null) return;

            for (let i = 0; i < event.changedTouches.length; i++) {
              const touch = event.changedTouches[i];
              if (touch.identifier === rightActiveTouchId) {
                const deltaX = touch.clientX - previousTouchX;
                const deltaY = touch.clientY - previousTouchY;

                            this.camera.rotation.y -= deltaX * 0.01; // Adjust sensitivity
                            this.camera.rotation.x -= deltaY * 0.01; // Adjust sensitivity
                // Limit vertical rotation (pitch) to prevent camera flipping
                const PI_2 = Math.PI / 2;
                this.camera.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.camera.rotation.x));

                previousTouchX = touch.clientX;
                previousTouchY = touch.clientY;

                // Visual feedback for joystick handle
                const rect = joystickRightEl.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const currentX = touch.clientX - centerX;
                const currentY = touch.clientY - centerY;

                const maxDistance = rect.width / 2;
                const distance = Math.min(maxDistance, Math.sqrt(
                  Math.pow(currentX, 2) + Math.pow(currentY, 2)
                ));
                const angle = Math.atan2(currentY, currentX);
                const handleX = Math.cos(angle) * distance;
                const handleY = Math.sin(angle) * distance;

                if (joystickRightHandleEl) {
                    joystickRightHandleEl.style.transform = `translate3d(${handleX}px, ${handleY}px, 0)`;
                }
                break;
              }
            }
        }, { passive: false });

        joystickRightEl.addEventListener('touchend', (event: TouchEvent) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
              const touch = event.changedTouches[i];
              if (touch.identifier === rightActiveTouchId) {
                rightActiveTouchId = null;
                if (joystickRightHandleEl) {
                    joystickRightHandleEl.style.transform = `translate3d(0px, 0px, 0)`; // Reset handle position
                }
                break;
              }
            }
        });
      }
    }
  }


  updateMovementFromJoystick(pos: { x: number, y: number }): void {
    const threshold = 0.2; // Dead zone for joystick
    this.moveForward = pos.y < -threshold;
    this.moveBackward = pos.y > threshold;
    this.moveRight = pos.x > threshold;
    this.moveLeft = pos.x < -threshold;

    // Calculate magnitude of joystick displacement
    const magnitude = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    // Normalize magnitude to a speed factor, clamping between 0 and 1
    this.currentMoveSpeedFactor = Math.min(1, magnitude);
  }

  setupEventListeners(): void {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump === true) this.velocity.y += 350;
        this.canJump = false;
        break;
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/island/scene.gltf', // Path to your GLTF model
      (gltf: GLTF) => {
        this.model = gltf.scene;
        this.scene.add(this.model);

        // Optional: Adjust model scale and position if needed
        // The model can be quite large, so scaling it down might be necessary
        // this.model.scale.set(0.1, 0.1, 0.1); // Example scaling
        // this.model.position.y = -10; // Example vertical adjustment

        // Remove the temporary plane if model is loaded
        const plane = this.scene.getObjectByName('plane'); // Assuming the plane has a name
        if (plane) {
            this.scene.remove(plane);
        }
      },
      (xhr: ProgressEvent) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error: unknown) => {
        console.error('Error loading GLTF model', error);
      }
    );
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;

    if (this.isMobile) {
        // Mobile movement logic using joystick
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta; // Basic gravity

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) this.velocity.z += this.direction.z * (100.0 * this.currentMoveSpeedFactor) * delta; // Add velocity based on joystick input (variable speed)
        if (this.moveLeft || this.moveRight) this.velocity.x += this.direction.x * (100.0 * this.currentMoveSpeedFactor) * delta; // Add velocity based on joystick input (variable speed)

        // Apply movement relative to camera direction
        // For DeviceOrientationControls, camera rotation is handled, so movement needs to be adjusted
        this.camera.translateZ(-this.velocity.z * delta * 50); // Multiplier for speed
        this.camera.translateX(this.velocity.x * delta * 50); // Multiplier for speed
        this.camera.position.y += (this.velocity.y * delta);

        if (this.camera.position.y < 10) { // Assuming ground is at y=0, character height 10
            this.velocity.y = 0;
            this.camera.position.y = 10;
            this.canJump = true;
        }

    } else if (this.pointerLockControls && this.pointerLockControls.isLocked === true) {
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 100.0 * delta; // 100 = mass

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 600.0 * delta;
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 600.0 * delta;

      this.pointerLockControls.moveRight(-this.velocity.x * delta);
      this.pointerLockControls.moveForward(-this.velocity.z * delta);

      this.camera.position.y += (this.velocity.y * delta);

      if (this.camera.position.y < 10) {
        this.velocity.y = 0;
        this.camera.position.y = 10;
        this.canJump = true;
      }
    }

    this.prevTime = time;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
