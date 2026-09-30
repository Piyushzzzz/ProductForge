import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Admin3DGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Outer Wireframe Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(7.5, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const mainSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(mainSphere);

    // Inner Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(4.5, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    scene.add(innerCore);

    // Security Node Points around Globe
    const nodeCount = 35;
    const nodeGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const nodesGroup = new THREE.Group();

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      node.position.setFromSphericalCoords(7.5, phi, theta);
      nodesGroup.add(node);
    }
    scene.add(nodesGroup);

    // Orbital Rings
    const ringGeo = new THREE.RingGeometry(9.5, 9.7, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      mainSphere.rotation.y = elapsed * 0.15;
      mainSphere.rotation.x = Math.sin(elapsed * 0.1) * 0.2;

      innerCore.rotation.y = -elapsed * 0.25;
      nodesGroup.rotation.y = elapsed * 0.15;
      nodesGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.2;

      ring.rotation.z = elapsed * 0.2;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
