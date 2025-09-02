import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface SolanaTokenAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

export function SolanaTokenAnimation({ 
  width = 400, 
  height = 300, 
  className = "" 
}: SolanaTokenAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0a0f, 1);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create Solana token geometry - stylized coin
    const tokenGroup = new THREE.Group();

    // Main coin body
    const coinGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
    const coinMaterial = new THREE.MeshPhongMaterial({
      color: 0x14f195,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    tokenGroup.add(coin);

    // Solana logo ring
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 8, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x9945ff,
      emissive: 0x9945ff,
      emissiveIntensity: 0.3
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    tokenGroup.add(ring);

    // Inner glow sphere
    const glowGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x14f195,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    tokenGroup.add(glow);

    // Orbiting particles
    const particles = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x14f195 : 0x9945ff,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      const angle = (i / 12) * Math.PI * 2;
      const radius = 2.5;
      particle.position.x = Math.cos(angle) * radius;
      particle.position.z = Math.sin(angle) * radius;
      particle.position.y = (Math.random() - 0.5) * 0.5;
      
      particles.add(particle);
    }
    tokenGroup.add(particles);

    scene.add(tokenGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x14f195, 0.8, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Optimized animation loop with frame throttling
    let frameCount = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      frameCount++;

      // Reduce animation frequency to every 2nd frame
      if (frameCount % 2 === 0) {
        // Rotate main token
        tokenGroup.rotation.y += 0.01;
        
        // Gentle floating motion
        tokenGroup.position.y = Math.sin(Date.now() * 0.001) * 0.2;
        
        // Rotate particles around token
        particles.rotation.y += 0.015;
        particles.rotation.x += 0.005;
        
        // Animate ring
        ring.rotation.z += 0.005;
        
        // Simplified pulse glow effect
        const pulse = Math.sin(Date.now() * 0.002) * 0.1 + 0.9;
        glow.scale.set(pulse, pulse, pulse);
      }
      
      // Simplified particle animation (every 4th frame)
      if (frameCount % 4 === 0) {
        particles.children.forEach((particle, index) => {
          if (particle instanceof THREE.Mesh && index % 2 === 0) {
            const time = Date.now() * 0.0005;
            particle.position.y = Math.sin(time + index) * 0.2;
          }
        });
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Clean up geometries and materials
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [width, height]);

  return (
    <div 
      className={`rounded-xl overflow-hidden bg-gradient-to-br from-galaxy-purple/20 to-galaxy-blue/20 ${className}`}
      style={{ width, height }}
    >
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}