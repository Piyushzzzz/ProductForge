import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Background3DProps {
  variant?: 'BUYER' | 'CREATOR' | 'ADMIN';
}

export const Background3D: React.FC<Background3DProps> = ({ variant = 'BUYER' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── Scene & Fog Setup ───
    const scene = new THREE.Scene();
    const fogColor = variant === 'ADMIN' ? 0x05100a : (variant === 'CREATOR' ? 0x100918 : 0x060913);
    scene.fog = new THREE.FogExp2(fogColor, 0.018);

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

    // ─── Palette Setup Based on Persona ───
    let particleColorPalette: THREE.Color[];
    let gridColorHex: number;

    if (variant === 'ADMIN') {
      particleColorPalette = [
        new THREE.Color(0x10b981), // Emerald
        new THREE.Color(0x34d399), // Mint
        new THREE.Color(0xef4444), // Crimson
        new THREE.Color(0x059669)  // Deep Green
      ];
      gridColorHex = 0x10b981;
    } else if (variant === 'CREATOR') {
      particleColorPalette = [
        new THREE.Color(0xf59e0b), // Amber
        new THREE.Color(0x818cf8), // Violet
        new THREE.Color(0xd946ef), // Fuchsia
        new THREE.Color(0xf97316)  // Orange
      ];
      gridColorHex = 0xf59e0b;
    } else {
      // BUYER
      particleColorPalette = [
        new THREE.Color(0x6366f1), // Indigo
        new THREE.Color(0x22d3ee), // Cyan
        new THREE.Color(0x38bdf8), // Light Blue
        new THREE.Color(0x10b981)  // Emerald
      ];
      gridColorHex = 0x22d3ee;
    }

    // ─── 3D Particles ───
    const particleCount = variant === 'ADMIN' ? 900 : 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 130;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 130;

      const color = particleColorPalette[Math.floor(Math.random() * particleColorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: variant === 'ADMIN' ? 1.4 : 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ─── 3D Grid Floor ───
    const gridGeometry = new THREE.PlaneGeometry(160, 160, 40, 40);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: gridColorHex,
      wireframe: true,
      transparent: true,
      opacity: variant === 'ADMIN' ? 0.12 : 0.08
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -15;
    scene.add(gridMesh);

    // ─── Persona Specific 3D Mesh Object ───
    let specialMesh: THREE.Mesh;
    if (variant === 'ADMIN') {
      // Interconnected Security Globe Sphere for Admin Command
      const geo = new THREE.DodecahedronGeometry(14, 2);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      specialMesh = new THREE.Mesh(geo, mat);
      specialMesh.position.set(30, 0, -25);
    } else if (variant === 'CREATOR') {
      // Floating Torus Knot for Creator Studio Telemetry
      const geo = new THREE.TorusKnotGeometry(8, 2, 64, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
        transparent: true,
        opacity: 0.14
      });
      specialMesh = new THREE.Mesh(geo, mat);
      specialMesh.position.set(-30, 5, -25);
    } else {
      // Glowing Icosahedron for Buyer Vault
      const geo = new THREE.IcosahedronGeometry(10, 2);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      specialMesh = new THREE.Mesh(geo, mat);
      specialMesh.position.set(-25, 5, -20);
    }
    scene.add(specialMesh);

    // ─── Mouse Movement Damping ───
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

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 0.8;
      camera.position.y = 12 - targetY * 0.8;
      camera.lookAt(0, 0, 0);

      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

      if (specialMesh) {
        specialMesh.rotation.x = elapsedTime * 0.1;
        specialMesh.rotation.y = elapsedTime * 0.15;
      }

      // Undulate grid floor vertices
      const posAttr = gridGeometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        posAttr.setZ(i, Math.sin(elapsedTime * 1.5 + x * 0.1 + y * 0.1) * 1.5);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [variant]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
};
