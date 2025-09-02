import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface SimpleThreeSceneProps {
  className?: string;
  height?: string;
}

export function SimpleThreeScene({ className = "", height = "300px" }: SimpleThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create particle system
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // Solana colors
      const intensity = Math.random();
      colors[i * 3] = 0.6 + intensity * 0.4;
      colors[i * 3 + 1] = 0.3 + intensity * 0.4;
      colors[i * 3 + 2] = 0.9 + intensity * 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Add floating octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.8);
    const octaMat = new THREE.MeshBasicMaterial({ 
      color: 0x14f195, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.6 
    });
    const octa = new THREE.Mesh(octaGeo, octaMat);
    scene.add(octa);

    camera.position.z = 8;

    // Optimized animation loop with frame throttling
    let animationId: number;
    let frameCount = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frameCount++;
      
      // Reduce animation frequency to every 3rd frame
      if (frameCount % 3 === 0) {
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;
        
        octa.rotation.x += 0.005;
        octa.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      octaGeo.dispose();
      octaMat.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden rounded-lg ${className}`} 
      style={{ height }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-galaxy-dark/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

// Mini version for smaller components
export function MiniThreeScene({ className = "", height = "200px" }: SimpleThreeSceneProps) {
  const miniContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!miniContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, miniContainerRef.current.clientWidth / miniContainerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    
    renderer.setSize(miniContainerRef.current.clientWidth, miniContainerRef.current.clientHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    miniContainerRef.current.appendChild(renderer.domElement);

    // Simple rotating shape
    const geometry = new THREE.OctahedronGeometry(1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x9945ff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.7 
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 5;

    let animationId: number;
    let frameCount = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frameCount++;
      
      // Reduce animation frequency to every 4th frame
      if (frameCount % 4 === 0) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (miniContainerRef.current && renderer.domElement) {
        miniContainerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div 
      ref={miniContainerRef}
      className={`relative overflow-hidden rounded-lg ${className}`} 
      style={{ height }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-galaxy-dark/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}