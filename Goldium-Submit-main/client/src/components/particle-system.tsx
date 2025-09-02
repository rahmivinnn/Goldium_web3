import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

interface ParticleSystemProps {
  particleCount?: number;
  color?: string;
  size?: number;
  speed?: number;
  interactive?: boolean;
  waveEffect?: boolean;
  connectionLines?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 300,
  color = '#FFD700',
  size = 2,
  speed = 0.002,
  interactive = false,
  waveEffect = false,
  connectionLines = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    // Renderer setup optimized for performance
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced particle geometry with multiple attributes
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);

    // Initialize particles with enhanced properties
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;
      
      // Store original positions for wave effect
      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];

      // Velocity
      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;
      
      // Color variation (golden theme)
      const colorVariation = Math.random();
      colors[i3] = 1.0; // Red
      colors[i3 + 1] = 0.8 + colorVariation * 0.2; // Green
      colors[i3 + 2] = 0.0 + colorVariation * 0.3; // Blue
      
      // Size variation
      sizes[i] = size * (0.5 + Math.random() * 1.5);
      
      // Phase for wave animation
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Enhanced particle material with vertex colors
    const material = new THREE.PointsMaterial({
      size: size,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
      alphaTest: 0.1,
      fog: false
    });

    // Create particle system
    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);
    
    // Add ambient lighting for better visual depth
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Add point light that follows mouse
    const pointLight = new THREE.PointLight(0xFFD700, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Enhanced mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
      
      // Update point light position
      pointLight.position.x = mouse.x * 10;
      pointLight.position.y = mouse.y * 10;
    };
    
    if (interactive) {
      window.addEventListener('mousemove', onMouseMove);
    }

    // Enhanced animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016; // ~60fps

      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      
      // Update particle positions with advanced effects
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Basic movement
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];
        
        // Wave effect
        if (waveEffect) {
          const waveX = Math.sin(timeRef.current * 0.5 + phases[i]) * 2;
          const waveY = Math.cos(timeRef.current * 0.3 + phases[i] * 1.5) * 1.5;
          positions[i3] = originalPositions[i3] + waveX;
          positions[i3 + 1] = originalPositions[i3 + 1] + waveY;
        }
        
        // Mouse interaction effect
        if (interactive) {
          const dx = mouseRef.current.x - (positions[i3] + window.innerWidth / 2);
          const dy = mouseRef.current.y - (positions[i3 + 1] + window.innerHeight / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150;
            positions[i3] += (dx / distance) * force * 0.5;
            positions[i3 + 1] += (dy / distance) * force * 0.5;
            
            // Enhance color on interaction
            colors[i3] = Math.min(1.0, colors[i3] + force * 0.3);
            colors[i3 + 1] = Math.min(1.0, colors[i3 + 1] + force * 0.2);
            colors[i3 + 2] = Math.min(1.0, colors[i3 + 2] + force * 0.4);
            
            // Increase size on interaction
            sizes[i] = size * (1 + force * 2);
          } else {
            // Fade back to original color
            colors[i3] = Math.max(1.0, colors[i3] - 0.01);
            colors[i3 + 1] = Math.max(0.8, colors[i3 + 1] - 0.01);
            colors[i3 + 2] = Math.max(0.0, colors[i3 + 2] - 0.01);
            
            // Return to original size
            sizes[i] = Math.max(size * 0.5, sizes[i] - 0.1);
          }
        }

        // Boundary wrapping
        if (positions[i3] > 15) positions[i3] = -15;
        if (positions[i3] < -15) positions[i3] = 15;
        if (positions[i3 + 1] > 15) positions[i3 + 1] = -15;
        if (positions[i3 + 1] < -15) positions[i3 + 1] = 15;
        if (positions[i3 + 2] > 15) positions[i3 + 2] = -15;
        if (positions[i3 + 2] < -15) positions[i3 + 2] = 15;
      }

      // Update geometry attributes
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;

      // Smooth camera movement based on mouse
      if (interactive) {
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
      }
      
      // Gentle overall rotation
      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.001;
      particles.rotation.z += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (interactive) {
        window.removeEventListener('mousemove', onMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of all resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      // Clear refs
      sceneRef.current = null;
      rendererRef.current = null;
      particlesRef.current = null;
    };
  }, [particleCount, color, size, speed, interactive, waveEffect, connectionLines]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'transparent'
      }}
    />
  );
};

export default ParticleSystem;