import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// PHOTOREALISTIC TEXTURE GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

/** Generates the signature blue box texture matching the reference image */
function createBlueBoxTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Soft matte blue cardboard base (#70a5d4 / #629acb)
  ctx.fillStyle = '#6fa6d6';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Fine cardboard grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  for (let i = 0; i < 35000; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1.5, 1.5);
  }
  ctx.fillStyle = 'rgba(20, 60, 100, 0.05)';
  for (let i = 0; i < 25000; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1.5, 1.5);
  }

  // 3. Subtle lighter geometric pixel/checker blocks on top face (as in reference)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fillRect(40, 40, 180, 180);
  ctx.fillRect(220, 220, 160, 160);
  ctx.fillRect(600, 40, 160, 160);
  ctx.fillRect(760, 200, 180, 180);
  ctx.fillStyle = 'rgba(25, 75, 130, 0.08)';
  ctx.fillRect(220, 40, 180, 180);
  ctx.fillRect(600, 200, 160, 160);

  // 4. White Packaging Tape across the center (vertical ribbon)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(445, 0, 134, 1024);

  // Tape text "SHIPP-" repeated along the tape
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'rgba(60, 95, 140, 0.6)';
  ctx.textAlign = 'center';
  for (let y = 50; y < 1024; y += 110) {
    ctx.save();
    ctx.translate(512, y);
    ctx.fillText('SHIPP™', 0, 0);
    ctx.restore();
  }

  // 5. Crisp Shipping Barcode Labels on side/front
  // Top-left label
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(60, 720, 200, 120);
  ctx.fillStyle = '#1e293b';
  for (let b = 75; b < 245; b += 5 + (b % 4)) {
    const barW = (b % 3 === 0) ? 2.5 : 1.2;
    ctx.fillRect(b, 735, barW, 45);
  }
  ctx.font = 'bold 8px monospace';
  ctx.fillText('GTM-AIR-8921', 160, 798);
  ctx.fillText('EXPEDITED', 160, 814);

  // Bottom-right label
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(740, 720, 220, 130);
  ctx.fillStyle = '#1e293b';
  for (let b = 760; b < 940; b += 6 + (b % 3)) {
    const barW = (b % 2 === 0) ? 3 : 1.5;
    ctx.fillRect(b, 738, barW, 48);
  }
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SHIPP-DIRECT', 850, 805);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Generates the pale yellow-green cardboard texture with branding */
function createYellowBoxTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Pale yellow-green cardboard base (#edf5b0 / #e8f0a8)
  ctx.fillStyle = '#ebf3a9';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Grain
  ctx.fillStyle = 'rgba(160, 170, 60, 0.07)';
  for (let i = 0; i < 30000; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1.5, 1.5);
  }

  // 3. Subtle Tape
  ctx.fillStyle = 'rgba(238, 245, 185, 0.55)';
  ctx.fillRect(470, 0, 84, 1024);

  // 4. "SHIPP" vertical dark green typography on side
  ctx.save();
  ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'rgba(85, 105, 35, 0.65)';
  ctx.translate(70, 180);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('SHIPP™', 0, 0);
  ctx.restore();

  // 5. White Barcode Label
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(720, 640, 220, 140);
  ctx.fillStyle = '#1e293b';
  for (let b = 740; b < 920; b += 5 + (b % 4)) {
    const barW = (b % 3 === 0) ? 2.5 : 1.2;
    ctx.fillRect(b, 658, barW, 46);
  }
  ctx.font = 'bold 9px monospace';
  ctx.fillText('ZONE-DL-NORTH', 830, 725);
  ctx.fillText('STANDARD-GROUND', 830, 745);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Generates dark navy conveyor rubber belt texture */
function createBeltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep dark navy blue (#122038 / #0e1a2e)
  ctx.fillStyle = '#111e33';
  ctx.fillRect(0, 0, 512, 512);

  // Fine texture grooves
  for (let y = 0; y < 512; y += 6) {
    ctx.fillStyle = (y % 12 === 0) ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, y, 512, 1.5);
  }

  // Micro rubber speckles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 15000; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Generates smartphone screen with delivery tracking map */
function createPhoneScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Map Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 1024);

  // Header & Dynamic Island
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 130);
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(176, 22, 160, 36, 18);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.fillText('Live Tracking', 36, 100);

  // Map Roads & Grids
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(0, 260); ctx.lineTo(512, 300);
  ctx.moveTo(90, 130); ctx.lineTo(130, 920);
  ctx.moveTo(350, 130); ctx.lineTo(390, 920);
  ctx.moveTo(0, 600); ctx.lineTo(512, 560);
  ctx.stroke();

  // Route Polyline (Zomato Red Accent)
  ctx.strokeStyle = '#e23744';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(130, 740);
  ctx.lineTo(240, 580);
  ctx.lineTo(380, 500);
  ctx.lineTo(350, 280);
  ctx.stroke();

  // Pin Markers
  ctx.fillStyle = '#e23744';
  ctx.beginPath(); ctx.arc(350, 280, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(350, 280, 6, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#cb202d';
  ctx.beginPath(); ctx.arc(240, 580, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fda4af';
  ctx.beginPath(); ctx.arc(240, 580, 8, 0, Math.PI * 2); ctx.fill();

  // Bottom Floating Delivery Card
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(24, 760, 464, 220, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 18px -apple-system, sans-serif';
  ctx.fillText('● EN ROUTE · SHIP IT EXPRESS', 48, 810);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 28px -apple-system, sans-serif';
  ctx.fillText('ETA: 12 Mins', 48, 860);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px -apple-system, sans-serif';
  ctx.fillText('Tracking #SHP-2026-8921', 48, 905);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D CONVEYOR SCENE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface ConveyorHero3DProps {
  className?: string;
  showOverlay?: boolean;
}

export const ConveyorHero3D: React.FC<ConveyorHero3DProps> = ({
  className = "absolute inset-0",
  showOverlay = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = null; // Transparent to blend seamlessly into light background

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 2. Camera Setup (Low FOV for true isometric-style commercial telephoto look)
    const camera = new THREE.PerspectiveCamera(26, width / height, 0.1, 100);
    // Camera positioned looking down diagonally across the conveyor track
    const baseCamPos = new THREE.Vector3(-10.5, 12.8, 12.2);
    camera.position.copy(baseCamPos);
    const lookTarget = new THREE.Vector3(0.5, 0.2, -0.8);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting (Warm Key + Soft Cyan Rim + Ambient)
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#edf5b0', 1.1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Key Directional Light (Casts soft directional shadows)
    const dirLight = new THREE.DirectionalLight('#fffdf0', 2.9);
    dirLight.position.set(12, 22, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 45;
    dirLight.shadow.camera.left = -14;
    dirLight.shadow.camera.right = 14;
    dirLight.shadow.camera.top = 14;
    dirLight.shadow.camera.bottom = -14;
    dirLight.shadow.bias = -0.0002;
    dirLight.shadow.radius = 2.8;
    scene.add(dirLight);

    // Soft Rim Light
    const rimLight = new THREE.DirectionalLight('#bae6fd', 1.2);
    rimLight.position.set(-12, 8, -8);
    scene.add(rimLight);

    // 4. Textures & Materials
    const blueBoxTex = createBlueBoxTexture();
    const yellowBoxTex = createYellowBoxTexture();
    const beltTex = createBeltTexture();
    const phoneScreenTex = createPhoneScreenTexture();

    const blueBoxMat = new THREE.MeshStandardMaterial({
      map: blueBoxTex,
      roughness: 0.45,
      metalness: 0.05,
    });

    const yellowBoxMat = new THREE.MeshStandardMaterial({
      map: yellowBoxTex,
      roughness: 0.55,
      metalness: 0.02,
    });

    // Dark navy belt material
    const beltMat = new THREE.MeshStandardMaterial({
      map: beltTex,
      roughness: 0.35,
      metalness: 0.12,
      color: new THREE.Color('#0f1e33'),
    });

    // Light-blue powder-coated metal frame rails
    const railMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#82b2dd'),
      roughness: 0.22,
      metalness: 0.32,
    });

    // Smartphone Materials
    const phoneBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f1f5f9'),
      metalness: 0.85,
      roughness: 0.18,
    });
    const phoneScreenMat = new THREE.MeshBasicMaterial({
      map: phoneScreenTex,
    });

    // 5. Conveyor Assembly
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // Diagonal angle: Exactly matches the reference image diagonal running from top-left to bottom-right
    const CONVEYOR_ROT_Y = -Math.PI / 4; // -45 degrees
    conveyorGroup.rotation.y = CONVEYOR_ROT_Y;

    const BELT_LENGTH = 38;
    const BELT_WIDTH = 2.7;
    const BELT_SURFACE_Y = 0.25;

    // 5.1 Moving Rubber Belt
    const beltGeo = new THREE.BoxGeometry(BELT_WIDTH, 0.06, BELT_LENGTH);
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    beltMesh.position.y = BELT_SURFACE_Y;
    beltMesh.receiveShadow = true;
    conveyorGroup.add(beltMesh);

    // 5.2 Powder Blue Structural Side Rails (Trough)
    const railThickness = 0.28;
    const railHeight = 0.55;
    const railGeo = new THREE.BoxGeometry(railThickness, railHeight, BELT_LENGTH);

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-BELT_WIDTH / 2 - railThickness / 2, railHeight / 2 - 0.05, 0);
    leftRail.castShadow = true;
    leftRail.receiveShadow = true;
    conveyorGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(BELT_WIDTH / 2 + railThickness / 2, railHeight / 2 - 0.05, 0);
    rightRail.castShadow = true;
    rightRail.receiveShadow = true;
    conveyorGroup.add(rightRail);

    // 6. Packages Traveling on the Belt (Reference Layout)
    interface ConveyorItem {
      mesh: THREE.Object3D;
      offsetZ: number;
    }
    const conveyorItems: ConveyorItem[] = [];

    const createBox = (w: number, h: number, d: number, mat: THREE.Material) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const createPhone = () => {
      const group = new THREE.Group();
      const phoneW = 0.78;
      const phoneH = 0.045;
      const phoneL = 1.52;

      const bodyGeo = new THREE.BoxGeometry(phoneW, phoneH, phoneL);
      const body = new THREE.Mesh(bodyGeo, phoneBodyMat);
      body.castShadow = true;
      group.add(body);

      const screenGeo = new THREE.PlaneGeometry(phoneW * 0.93, phoneL * 0.94);
      const screen = new THREE.Mesh(screenGeo, phoneScreenMat);
      screen.rotation.x = -Math.PI / 2;
      screen.position.y = phoneH / 2 + 0.005;
      group.add(screen);

      return group;
    };

    // Item 1: Blue Box 1 (Foreground / Lower-Right)
    const box1 = createBox(1.95, 0.95, 1.35, blueBoxMat);
    box1.position.set(0.12, BELT_SURFACE_Y + 0.95 / 2, 5.2);
    conveyorGroup.add(box1);
    conveyorItems.push({ mesh: box1, offsetZ: 5.2 });

    // Item 2: Blue Box 2 (Mid-Conveyor)
    const box2 = createBox(1.85, 0.88, 1.28, blueBoxMat);
    box2.position.set(-0.18, BELT_SURFACE_Y + 0.88 / 2, 0.8);
    conveyorGroup.add(box2);
    conveyorItems.push({ mesh: box2, offsetZ: 0.8 });

    // Item 3: Smartphone lying flat on belt (as in reference image)
    const phone = createPhone();
    phone.position.set(0.25, BELT_SURFACE_Y + 0.025, -2.9);
    phone.rotation.y = 0.15;
    conveyorGroup.add(phone);
    conveyorItems.push({ mesh: phone, offsetZ: -2.9 });

    // Item 4: Blue Box 3 (Upper-Left / Background)
    const box3 = createBox(1.75, 0.82, 1.22, blueBoxMat);
    box3.position.set(-0.1, BELT_SURFACE_Y + 0.82 / 2, -6.8);
    conveyorGroup.add(box3);
    conveyorItems.push({ mesh: box3, offsetZ: -6.8 });

    // Item 5: Blue Box 4 (Far Background Queue)
    const box4 = createBox(1.85, 0.9, 1.3, blueBoxMat);
    box4.position.set(0.15, BELT_SURFACE_Y + 0.9 / 2, -11.2);
    conveyorGroup.add(box4);
    conveyorItems.push({ mesh: box4, offsetZ: -11.2 });

    // Item 6: Blue Box 5 (Entry Queue for seamless loop)
    const box5 = createBox(1.8, 0.85, 1.25, blueBoxMat);
    box5.position.set(-0.12, BELT_SURFACE_Y + 0.85 / 2, -15.6);
    conveyorGroup.add(box5);
    conveyorItems.push({ mesh: box5, offsetZ: -15.6 });

    // 7. Wall-to-Wall Dense Stacks of Pale Yellow Boxes (Matching Reference Environment)
    const yellowBoxesGroup = new THREE.Group();
    scene.add(yellowBoxesGroup);

    // Stacks flanking the conveyor on both sides:
    // A. Upper-Right / Background Stacks
    for (let col = -12; col <= 16; col += 1.62) {
      for (let row = -18; row <= 8; row += 1.62) {
        // Distance check from diagonal conveyor center (x + z)
        const distFromConveyor = (col + row);
        if (distFromConveyor < 1.8) continue; // Keep conveyor channel clear

        const stackHeight = (col > 2 || row < -2) ? 3 : 2;
        for (let h = 0; h < stackHeight; h++) {
          const bw = 1.48;
          const bh = 1.22;
          const bd = 1.48;
          const yellowBox = createBox(bw, bh, bd, yellowBoxMat);
          yellowBox.position.set(
            col,
            h * (bh + 0.01) + bh / 2 - 0.45,
            row
          );
          yellowBoxesGroup.add(yellowBox);
        }
      }
    }

    // B. Lower-Left / Foreground Stacks
    for (let col = -16; col <= 6; col += 1.62) {
      for (let row = -2; row <= 18; row += 1.62) {
        const distFromConveyor = (col + row);
        if (distFromConveyor > -1.8) continue; // Keep conveyor channel clear

        const stackHeight = (row > 6 || col < -4) ? 2 : 1;
        for (let h = 0; h < stackHeight; h++) {
          const bw = 1.48;
          const bh = 1.22;
          const bd = 1.48;
          const yellowBox = createBox(bw, bh, bd, yellowBoxMat);
          yellowBox.position.set(
            col,
            h * (bh + 0.01) + bh / 2 - 0.45,
            row
          );
          yellowBoxesGroup.add(yellowBox);
        }
      }
    }

    // 8. Mouse Parallax & Breathing
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 9. Resize Handling
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop (Moving Belt Texture + Traveling Packages)
    let lastTime = performance.now();
    let animationFrameId: number;

    const SPEED = 1.45; // Smooth physical conveyor velocity
    const LOOP_START_Z = -18.0;
    const LOOP_END_Z = 9.5;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // 1. Move Belt Texture UV continuously
      beltTex.offset.y -= SPEED * dt * 0.18;

      // 2. Move Conveyor Packages forward along the belt
      conveyorItems.forEach((item) => {
        item.offsetZ += SPEED * dt;
        if (item.offsetZ > LOOP_END_Z) {
          // Seamless loop back to conveyor entrance
          item.offsetZ = LOOP_START_Z + (item.offsetZ - LOOP_END_Z);
        }
        item.mesh.position.z = item.offsetZ;
      });

      // 3. Subtle Camera Floating & Gentle Parallax
      const targetX = baseCamPos.x + mouseX * 0.35 + Math.sin(time * 0.0005) * 0.08;
      const targetY = baseCamPos.y + mouseY * 0.25 + Math.cos(time * 0.0006) * 0.06;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      blueBoxTex.dispose();
      yellowBoxTex.dispose();
      beltTex.dispose();
      phoneScreenTex.dispose();
    };
  }, []);

  return (
    <div className={`${className} overflow-hidden select-none pointer-events-none`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Light Atmospheric Vignette for Content Readability */}
      {showOverlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/90 via-slate-50/40 to-transparent pointer-events-none" />
        </>
      )}
    </div>
  );
};
