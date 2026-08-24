import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Background3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── Scene Setup ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.018);

    // ─── Camera ───
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 35);

    // ─── Renderer ───
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── 3D Floating Particle Mesh ───
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0x22d3ee), // Cyan
      new THREE.Color(0x818cf8), // Soft Violet
      new THREE.Color(0x10b981)  // Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Shader Material
    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ─── 3D Wireframe Grid Floor ───
    const gridGeometry = new THREE.PlaneGeometry(160, 160, 40, 40);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -15;
    scene.add(gridMesh);

    // ─── Ambient Glow Spheres ───
    const sphereGeo = new THREE.IcosahedronGeometry(8, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const glowSphere = new THREE.Mesh(sphereGeo, sphereMat);
    glowSphere.position.set(-25, 5, -20);
    scene.add(glowSphere);

    const sphereGeo2 = new THREE.IcosahedronGeometry(12, 2);
    const sphereMat2 = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.09
    });
    const glowSphere2 = new THREE.Mesh(sphereGeo2, sphereMat2);
    glowSphere2.position.set(30, -5, -30);
    scene.add(glowSphere2);

    // ─── Interactive Mouse Damping ───
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.015;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.015;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ─── Resize Handler ───
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // ─── Animation Loop ───
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Damped camera movement based on mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 0.8;
      camera.position.y = 12 - targetY * 0.8;
      camera.lookAt(0, 0, 0);

      // Rotate particle cloud & spheres slowly
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

      glowSphere.rotation.x = elapsedTime * 0.1;
      glowSphere.rotation.y = elapsedTime * 0.15;

      glowSphere2.rotation.x = -elapsedTime * 0.08;
      glowSphere2.rotation.z = elapsedTime * 0.12;

      // Undulate grid floor vertices
      const posAttr = gridGeometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const z = posAttr.getZ(i);
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        posAttr.setZ(i, Math.sin(elapsedTime * 1.5 + x * 0.1 + y * 0.1) * 1.5);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
};
