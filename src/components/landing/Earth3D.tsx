'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

// TWINKLING NEBULA PARTICLES
function NebulaBackground() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 1500 star particles
  const [positions, colors, sizes] = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const purple = new THREE.Color('#7c3aed');
    const cyan = new THREE.Color('#06b6d4');
    const pink = new THREE.Color('#ec4899');

    for (let i = 0; i < count; i++) {
      // Distribute in a spherical cloud around the scene
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 8 + Math.random() * 25; // outer shell

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Color interpolation
      let mixedColor = purple.clone();
      const roll = Math.random();
      if (roll < 0.33) {
        mixedColor.lerp(cyan, Math.random());
      } else if (roll < 0.66) {
        mixedColor.lerp(pink, Math.random());
      } else {
        mixedColor.multiplyScalar(0.3); // dim stars
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Rotate nebula slowly
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.015;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.005) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// SLOW-ROTATING EARTH WITH ATMOSPHERE AND LATITUDE RINGS
function EarthMesh() {
  const earthRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
    if (glowRef.current) {
      // Atmosphere slow rotation
      glowRef.current.rotation.y = clock.getElapsedTime() * 0.035;
    }
  });

  // Generate orbit paths
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 3.2, 0, Math.sin(theta) * 3.2));
    }
    return points;
  }, []);

  return (
    <group ref={earthRef}>
      {/* Earth Core Sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#0d1b3e"
          emissive="#040b24"
          emissiveIntensity={0.5}
          roughness={0.75}
          metalness={0.4}
        />
      </Sphere>

      {/* Grid lines (latitude) */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((y, i) => {
        const radius = Math.sqrt(4 - y * y);
        return (
          <mesh key={`lat-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.008, radius + 0.008, 64]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Grid lines (longitude) */}
      {[0, 45, 90, 135].map((angle, i) => (
        <mesh key={`lng-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <ringGeometry args={[1.99, 2.01, 64]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Atmospheric Glow Shell */}
      <Sphere ref={glowRef} args={[2.12, 64, 64]}>
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Outer Galactic Purple Rim Glow */}
      <Sphere args={[2.3, 32, 32]}>
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Render Orbiting Satellites with their trails */}
      <OrbitingSatellite radius={3.2} speed={0.4} angleOffset={0} color="#06b6d4" trail={orbitPoints} />
      <OrbitingSatellite radius={3.8} speed={-0.25} angleOffset={Math.PI / 3} color="#a78bfa" />
      <OrbitingSatellite radius={2.7} speed={0.55} angleOffset={Math.PI / 1.5} color="#ec4899" />
    </group>
  );
}

// SAT SENSING TRAILING DOTS
function OrbitingSatellite({ 
  radius, 
  speed, 
  angleOffset, 
  color,
  trail
}: { 
  radius: number; 
  speed: number; 
  angleOffset: number; 
  color: string;
  trail?: THREE.Vector3[];
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed + angleOffset;
      // Orbit coordinate mapping
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.8) * (radius * 0.25); // orbital tilt
    }
  });

  return (
    <group>
      {/* Orbital Path Trail */}
      {trail && (
        <Line
          points={trail}
          color={color}
          lineWidth={0.5}
          opacity={0.12}
          transparent
        />
      )}

      {/* Active Satellite Marker */}
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        
        {/* Glow pulsing ring around sat */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.15, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        <pointLight color={color} intensity={0.8} distance={3} />
      </group>
    </group>
  );
}

function FloatingPlanet({ position, color, size, speed }: { position: [number, number, number]; color: string; size: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * speed) * 0.4;
      ref.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Sphere ref={ref} args={[size, 32, 32]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.1}
        roughness={0.6}
        metalness={0.2}
      />
    </Sphere>
  );
}

// SCROLL CONNECTED CAM
function SceneOrchestrator() {
  useFrame(({ camera }) => {
    // Parallax scroll reaction
    if (typeof window !== 'undefined') {
      const scrollY = window.scrollY || 0;
      
      // Zoom camera out as user scrolls
      camera.position.z = 6 + scrollY * 0.004;
      // Rotate/skew camera slightly on scroll
      camera.position.y = 0.5 + scrollY * 0.0015;
      camera.position.x = Math.sin(scrollY * 0.001) * 0.5;
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[6, 4, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-6, -4, -5]} intensity={0.6} color="#7c3aed" />
      <pointLight position={[4, 6, -3]} intensity={0.5} color="#06b6d4" />

      <EarthMesh />
      <NebulaBackground />

      {/* Floating background celestial objects */}
      <FloatingPlanet position={[5, 2.5, -4]} color="#b25d2b" size={0.35} speed={0.4} />
      <FloatingPlanet position={[-5, -2, -5]} color="#a13d2d" size={0.25} speed={0.3} />
      <FloatingPlanet position={[-4, 3.5, -6]} color="#e0ceb5" size={0.45} speed={0.5} />
    </>
  );
}

export default function Earth3D() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: 'transparent' }}
      >
        <SceneOrchestrator />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.65}
          minPolarAngle={Math.PI * 0.35}
        />
      </Canvas>
    </div>
  );
}
