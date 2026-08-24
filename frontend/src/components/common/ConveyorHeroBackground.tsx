import React, { useEffect, useRef, useState } from 'react';

interface Parcel {
  id: number;
  progress: number; // 0 (top right) to 1.3 (bottom left exit)
  type: 'box-cyan' | 'box-teal' | 'box-kraft' | 'mailer-blue' | 'device';
  width: number;
  length: number;
  height: number;
  trackingCode: string;
  weight: string;
  scanned: boolean;
  scanFlash: number; // 0 to 1
}

export const ConveyorHeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSpeed, setActiveSpeed] = useState<number>(1);
  const [fps, setFps] = useState<number>(60);
  const [lastScannedCode, setLastScannedCode] = useState<string>('GTM-DEL-8942');
  const [scannerPulse, setScannerPulse] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    // Responsive Canvas Resize
    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial Conveyor Parcels
    const initialParcels: Parcel[] = [
      { id: 1, progress: 0.1, type: 'box-cyan', width: 62, length: 78, height: 42, trackingCode: 'GTM-DL-9821', weight: '2.4 kg', scanned: false, scanFlash: 0 },
      { id: 2, progress: 0.32, type: 'mailer-blue', width: 70, length: 85, height: 18, trackingCode: 'GTM-HR-4512', weight: '0.8 kg', scanned: false, scanFlash: 0 },
      { id: 3, progress: 0.54, type: 'device', width: 48, length: 94, height: 10, trackingCode: 'LIVE-GPS-NAV', weight: '210 g', scanned: false, scanFlash: 0 },
      { id: 4, progress: 0.78, type: 'box-teal', width: 66, length: 82, height: 46, trackingCode: 'GTM-UP-3319', weight: '3.1 kg', scanned: true, scanFlash: 0 },
      { id: 5, progress: 1.02, type: 'box-kraft', width: 58, length: 72, height: 38, trackingCode: 'GTM-RJ-1087', weight: '1.9 kg', scanned: true, scanFlash: 0 },
    ];

    let parcels = [...initialParcels];
    let nextParcelId = 6;
    let beltOffset = 0;

    const parcelTypes: Parcel['type'][] = ['box-cyan', 'box-teal', 'box-kraft', 'mailer-blue', 'device'];
    const sampleWeights = ['1.2 kg', '2.8 kg', '0.6 kg', '4.5 kg', '3.2 kg', '1.8 kg'];

    // Render loop
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // FPS tracking
      frameCount++;
      if (time - fpsTimer > 1000) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      if (!containerRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Isometric Conveyor Geometry Definition
      // Origin: top-right area (e.g. x: width * 1.05, y: height * 0.05)
      // End: bottom-left area (e.g. x: -width * 0.15, y: height * 0.95)
      const startX = width * 1.08;
      const startY = height * 0.04;
      const endX = -width * 0.12;
      const endY = height * 0.98;

      const trackLengthX = endX - startX;
      const trackLengthY = endY - startY;

      // Conveyor Belt Width in 2.5D Isometric Space
      const beltWidth = Math.max(140, width * 0.22);
      const perpAngle = Math.atan2(trackLengthY, trackLengthX) + Math.PI / 2;
      const offsetX = Math.cos(perpAngle) * (beltWidth / 2);
      const offsetY = Math.sin(perpAngle) * (beltWidth / 2);

      // ─────────────────────────────────────────────────────────────────────────
      // 1. CONVEYOR BELT TRACK (Smooth metallic belt with moving ribs)
      // ─────────────────────────────────────────────────────────────────────────
      beltOffset = (beltOffset + dt * 48 * activeSpeed) % 24;

      // Draw Belt Bed Shadow
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX - offsetX + 15, startY - offsetY + 25);
      ctx.lineTo(startX + offsetX + 15, startY + offsetY + 25);
      ctx.lineTo(endX + offsetX + 15, endY + offsetY + 25);
      ctx.lineTo(endX - offsetX + 15, endY - offsetY + 25);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.restore();

      // Belt Bed Surface
      const beltGrad = ctx.createLinearGradient(
        startX - offsetX, startY - offsetY,
        startX + offsetX, startY + offsetY
      );
      beltGrad.addColorStop(0, '#0a192f');
      beltGrad.addColorStop(0.15, '#132f4c');
      beltGrad.addColorStop(0.5, '#0b2038');
      beltGrad.addColorStop(0.85, '#1e3a5f');
      beltGrad.addColorStop(1, '#061325');

      ctx.beginPath();
      ctx.moveTo(startX - offsetX, startY - offsetY);
      ctx.lineTo(startX + offsetX, startY + offsetY);
      ctx.lineTo(endX + offsetX, endY + offsetY);
      ctx.lineTo(endX - offsetX, endY - offsetY);
      ctx.closePath();
      ctx.fillStyle = beltGrad;
      ctx.fill();

      // Belt Steel Rails (Sides)
      ctx.beginPath();
      ctx.moveTo(startX - offsetX, startY - offsetY);
      ctx.lineTo(endX - offsetX, endY - offsetY);
      ctx.lineTo(endX - offsetX - 8, endY - offsetY + 12);
      ctx.lineTo(startX - offsetX - 8, startY - offsetY + 12);
      ctx.closePath();
      ctx.fillStyle = '#64748b';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(startX + offsetX, startY + offsetY);
      ctx.lineTo(endX + offsetX, endY + offsetY);
      ctx.lineTo(endX + offsetX + 12, endY + offsetY + 16);
      ctx.lineTo(startX + offsetX + 12, startY + offsetY + 16);
      ctx.closePath();
      ctx.fillStyle = '#475569';
      ctx.fill();

      // Moving Texture Ribs / Grooves on Belt
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      const totalSteps = 80;
      for (let i = 0; i < totalSteps; i++) {
        const p = ((i * 24 + beltOffset) / (totalSteps * 24));
        if (p < 0 || p > 1) continue;
        const curX = startX + trackLengthX * p;
        const curY = startY + trackLengthY * p;

        ctx.beginPath();
        ctx.moveTo(curX - offsetX * 0.92, curY - offsetY * 0.92);
        ctx.lineTo(curX + offsetX * 0.92, curY + offsetY * 0.92);
        ctx.stroke();
      }
      ctx.restore();

      // ─────────────────────────────────────────────────────────────────────────
      // 2. LASER SCANNER ARCH & SCAN BEAM (Positioned around 48% progress)
      // ─────────────────────────────────────────────────────────────────────────
      const scannerProgress = 0.46;
      const scanX = startX + trackLengthX * scannerProgress;
      const scanY = startY + trackLengthY * scannerProgress;

      // Scanner Laser Line Fan
      ctx.save();
      const laserGrad = ctx.createLinearGradient(
        scanX - offsetX * 1.1, scanY - offsetY * 1.1,
        scanX + offsetX * 1.1, scanY + offsetY * 1.1
      );
      laserGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      laserGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.9)');
      laserGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      laserGrad.addColorStop(0.7, 'rgba(34, 197, 94, 0.9)');
      laserGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');

      ctx.beginPath();
      ctx.moveTo(scanX - offsetX * 1.1, scanY - offsetY * 1.1);
      ctx.lineTo(scanX + offsetX * 1.1, scanY + offsetY * 1.1);
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Scanner Arch Structure
      ctx.beginPath();
      ctx.moveTo(scanX - offsetX * 1.25, scanY - offsetY * 1.25 + 10);
      ctx.lineTo(scanX - offsetX * 1.25, scanY - offsetY * 1.25 - 65);
      ctx.lineTo(scanX + offsetX * 1.25, scanY + offsetY * 1.25 - 65);
      ctx.lineTo(scanX + offsetX * 1.25, scanY + offsetY * 1.25 + 10);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Scanner Sensor Head Emitter
      ctx.beginPath();
      ctx.arc(
        (scanX - offsetX * 1.25 + scanX + offsetX * 1.25) / 2,
        scanY - 65,
        5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────────────────
      // 3. PARCELS MOVEMENT & 3D ISOMETRIC RENDERING
      // ─────────────────────────────────────────────────────────────────────────
      // Sort parcels back-to-front so closer ones render on top of farther ones
      parcels.sort((a, b) => a.progress - b.progress);

      const moveSpeed = 0.085 * activeSpeed; // conveyor speed

      parcels.forEach((parcel) => {
        parcel.progress += dt * moveSpeed;

        // Check if parcel passes through the scanner
        if (!parcel.scanned && parcel.progress >= scannerProgress && parcel.progress <= scannerProgress + 0.08) {
          parcel.scanned = true;
          parcel.scanFlash = 1;
          setLastScannedCode(parcel.trackingCode);
          setScannerPulse(true);
          setTimeout(() => setScannerPulse(false), 260);
        }

        if (parcel.scanFlash > 0) {
          parcel.scanFlash = Math.max(0, parcel.scanFlash - dt * 2.5);
        }

        const p = parcel.progress;
        if (p < -0.1 || p > 1.3) return;

        const posX = startX + trackLengthX * p;
        const posY = startY + trackLengthY * p;

        ctx.save();
        ctx.translate(posX, posY);

        // 3.1 Contact Drop Shadow
        ctx.beginPath();
        ctx.ellipse(0, 10, parcel.length * 0.48, parcel.width * 0.28, 0.42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.filter = 'blur(6px)';
        ctx.fill();
        ctx.filter = 'none';

        // 3.2 3D Box / Package Geometry
        const hw = parcel.width * 0.46;
        const hl = parcel.length * 0.52;
        const h = parcel.height;

        // Isometric vertex offsets
        const vTop = { x: 0, y: -h - hl * 0.5 };
        const vRight = { x: hw, y: -h };
        const vBottom = { x: 0, y: -h + hl * 0.5 };
        const vLeft = { x: -hw, y: -h };

        const bRight = { x: hw, y: 0 };
        const bBottom = { x: 0, y: hl * 0.5 };
        const bLeft = { x: -hw, y: 0 };

        // Color palettes based on parcel type
        let topColor = '#38bdf8';
        let leftColor = '#0284c7';
        let rightColor = '#0369a1';
        let tapeColor = 'rgba(255, 255, 255, 0.85)';

        if (parcel.type === 'box-teal') {
          topColor = '#2dd4bf';
          leftColor = '#0d9488';
          rightColor = '#0f766e';
        } else if (parcel.type === 'box-kraft') {
          topColor = '#fde047';
          leftColor = '#ca8a04';
          rightColor = '#a16207';
          tapeColor = '#d97706';
        } else if (parcel.type === 'mailer-blue') {
          topColor = '#7dd3fc';
          leftColor = '#38bdf8';
          rightColor = '#0284c7';
        } else if (parcel.type === 'device') {
          topColor = '#0f172a';
          leftColor = '#020617';
          rightColor = '#1e293b';
        }

        // Apply scan flash glow
        if (parcel.scanFlash > 0) {
          topColor = '#86efac';
          leftColor = '#22c55e';
          rightColor = '#16a34a';
        }

        if (parcel.type === 'device') {
          // ── Realistic Smartphone / Live Telemetry Screen on Belt ──
          ctx.beginPath();
          ctx.moveTo(vTop.x, vTop.y);
          ctx.lineTo(vRight.x, vRight.y);
          ctx.lineTo(vBottom.x, vBottom.y);
          ctx.lineTo(vLeft.x, vLeft.y);
          ctx.closePath();
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Screen GPS Map Simulation
          ctx.beginPath();
          ctx.moveTo(vTop.x * 0.8, vTop.y * 0.8);
          ctx.lineTo(vRight.x * 0.8, vRight.y * 0.8);
          ctx.lineTo(vBottom.x * 0.8, vBottom.y * 0.8);
          ctx.lineTo(vLeft.x * 0.8, vLeft.y * 0.8);
          ctx.closePath();
          ctx.fillStyle = '#f8fafc';
          ctx.fill();

          // Mini route line on screen
          ctx.beginPath();
          ctx.moveTo(vLeft.x * 0.5, vLeft.y * 0.5);
          ctx.lineTo(vRight.x * 0.4, vRight.y * 0.4);
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Live Pulse Dot
          const pulseR = 3 + Math.sin(time * 0.008) * 1.5;
          ctx.beginPath();
          ctx.arc(vRight.x * 0.4, vRight.y * 0.4, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        } else {
          // ── Standard 3D Logistics Parcel ──
          // Left Face
          ctx.beginPath();
          ctx.moveTo(vLeft.x, vLeft.y);
          ctx.lineTo(vBottom.x, vBottom.y);
          ctx.lineTo(bBottom.x, bBottom.y);
          ctx.lineTo(bLeft.x, bLeft.y);
          ctx.closePath();
          ctx.fillStyle = leftColor;
          ctx.fill();

          // Right Face
          ctx.beginPath();
          ctx.moveTo(vBottom.x, vBottom.y);
          ctx.lineTo(vRight.x, vRight.y);
          ctx.lineTo(bRight.x, bRight.y);
          ctx.lineTo(bBottom.x, bBottom.y);
          ctx.closePath();
          ctx.fillStyle = rightColor;
          ctx.fill();

          // Top Face
          ctx.beginPath();
          ctx.moveTo(vTop.x, vTop.y);
          ctx.lineTo(vRight.x, vRight.y);
          ctx.lineTo(vBottom.x, vBottom.y);
          ctx.lineTo(vLeft.x, vLeft.y);
          ctx.closePath();
          ctx.fillStyle = topColor;
          ctx.fill();

          // Packaging Tape Strip on Top
          ctx.beginPath();
          ctx.moveTo((vTop.x + vLeft.x) / 2, (vTop.y + vLeft.y) / 2);
          ctx.lineTo((vTop.x + vRight.x) / 2, (vTop.y + vRight.y) / 2);
          ctx.lineTo((vBottom.x + vRight.x) / 2, (vBottom.y + vRight.y) / 2);
          ctx.lineTo((vBottom.x + vLeft.x) / 2, (vBottom.y + vLeft.y) / 2);
          ctx.closePath();
          ctx.fillStyle = tapeColor;
          ctx.fill();

          // Barcode Label on Right Face
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(vBottom.x + 6, vBottom.y + 4);
          ctx.lineTo(vRight.x * 0.7 + 6, vRight.y * 0.7 + 4);
          ctx.lineTo(vRight.x * 0.7 + 6, vRight.y * 0.7 + 18);
          ctx.lineTo(vBottom.x + 6, vBottom.y + 18);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Barcode mini lines
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          for (let b = 0; b < 4; b++) {
            ctx.beginPath();
            ctx.moveTo(vBottom.x + 9 + b * 4, vBottom.y + 7);
            ctx.lineTo(vBottom.x + 9 + b * 4, vBottom.y + 15);
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.restore();
      });

      // Respawn parcels when they travel off screen (p > 1.25)
      parcels = parcels.filter((p) => p.progress <= 1.25);

      const minProgress = Math.min(...parcels.map((p) => p.progress), 1);
      if (minProgress > 0.22) {
        const randomType = parcelTypes[Math.floor(Math.random() * parcelTypes.length)];
        const randomWeight = sampleWeights[Math.floor(Math.random() * sampleWeights.length)];
        const randomCode = `GTM-${['DEL', 'BLR', 'MUM', 'HYD', 'PNQ'][Math.floor(Math.random() * 5)]}-${Math.floor(1000 + Math.random() * 9000)}`;

        parcels.push({
          id: nextParcelId++,
          progress: -0.05,
          type: randomType,
          width: randomType === 'device' ? 48 : 55 + Math.random() * 20,
          length: randomType === 'device' ? 94 : 70 + Math.random() * 25,
          height: randomType === 'device' ? 10 : 32 + Math.random() * 20,
          trackingCode: randomCode,
          weight: randomWeight,
          scanned: false,
          scanFlash: 0,
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeSpeed]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* 1. Photorealistic Base 3D Warehouse Backdrop with subtle zoom breathe */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: `url('/images/conveyor_belt_hero.jpg')`,
        }}
      />

      {/* 2. Realistic 60FPS Conveyor Belt Canvas Simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-[1]"
        style={{ imageRendering: 'auto' }}
      />

      {/* 3. Real-Time HUD Overlay Chip (Live Telemetry & Scanner Status) */}
      <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-3 bg-slate-950/80 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-full shadow-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${scannerPulse ? 'bg-emerald-400 scale-125' : 'bg-cyan-400'} transition-all duration-150 animate-pulse`} />
          <span className="text-[11px] font-mono font-bold text-white tracking-wide">
            OPTICAL SCANNER: <span className="text-cyan-400">{lastScannedCode}</span>
          </span>
        </div>
        <div className="h-3 w-px bg-white/20" />
        <span className="text-[10px] font-mono text-emerald-400 font-bold">
          {fps} FPS · 100% ONLINE
        </span>
      </div>

      {/* 4. Cinematic Dark Gradient Vignettes for Headline Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-[2]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-black/70 via-transparent to-transparent z-[2]" />
    </div>
  );
};
