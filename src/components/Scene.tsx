"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, useTexture, Float, Text } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";

const ISLANDS = [
  { id: "crystal", url: "/island_crystal.jpg", name: "Crystal Realm", color: "#a020f0" },
  { id: "nature", url: "/island_nature.jpg", name: "Nature Realm", color: "#20f0a0" },
  { id: "fire", url: "/island_fire.jpg", name: "Fire Realm", color: "#f05020" },
  { id: "water", url: "/island_water.jpg", name: "Water Realm", color: "#20a0f0" },
];

function Island({ data, size, isTeleporting, setTeleportTarget }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.url);
  const [hovered, setHover] = useState(false);
  const router = useRouter();

  // Create a slight glowing effect material
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: hovered ? 1 : 0.8,
      color: hovered ? new THREE.Color(2, 2, 2) : new THREE.Color(1, 1, 1),
    });
  }, [texture, hovered]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isTeleporting) return;
    setTeleportTarget(data);
    
    // Play a sound or start transition
    setTimeout(() => {
      router.push(`/island/${data.id}`);
    }, 1500); // 1.5s for the animation
  };

  return (
    <Float
      speed={hovered ? 3 : 1.5} 
      rotationIntensity={hovered ? 0.2 : 0.1} 
      floatIntensity={hovered ? 2 : 1}
      position={data.position}
    >
      <group>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHover(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHover(false);
          }}
        >
          {/* We use a plane for the image */}
          <planeGeometry args={[size, size]} />
          <primitive object={material} attach="material" />
        </mesh>
        
        {/* Realm Name Text */}
        <Text
          position={[0, -(size / 2 + 0.3), 0]}
          fontSize={size * 0.12}
          color={hovered ? data.color : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={hovered ? 0.02 : 0.01}
          outlineColor="#000000"
        >
          {data.name}
        </Text>
      </group>
    </Float>
  );
}

function IslandGroup({ setTeleportTarget, teleportTarget }: any) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  
  // Calculate positions dynamically based on viewport
  // Diamond shape: Top, Left, Right, Bottom
  // 40% reduced size (3 * 0.6 = 1.8)
  const size = isMobile ? 1.4 : 1.8;
  const radiusX = isMobile ? viewport.width * 0.28 : Math.min(viewport.width * 0.25, 3);
  const radiusY = isMobile ? viewport.height * 0.35 : Math.min(viewport.height * 0.3, 2.5);

  const dynamicIslands = [
    { ...ISLANDS[0], position: [0.3, radiusY, -0.5] }, // Top (slightly right)
    { ...ISLANDS[1], position: [-radiusX, 0.2, 0.5] }, // Left (slightly up)
    { ...ISLANDS[2], position: [radiusX, -0.2, 0.5] }, // Right (slightly down)
    { ...ISLANDS[3], position: [-0.3, -radiusY, -0.5] }, // Bottom (slightly left)
  ];

  return (
    <>
      {dynamicIslands.map((island) => (
        <Island 
          key={island.id} 
          data={island} 
          size={size}
          isTeleporting={!!teleportTarget}
          setTeleportTarget={setTeleportTarget}
        />
      ))}
    </>
  );
}

function CameraController({ target }: { target: any }) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  
  useFrame((state, delta) => {
    if (target) {
      // Animate camera towards the target island for teleportation
      vec.set(target.position[0], target.position[1], target.position[2] + 0.5);
      camera.position.lerp(vec, delta * 3);
      
      // Look at the target
      const lookVec = new THREE.Vector3(target.position[0], target.position[1], target.position[2]);
      // state.camera.lookAt(lookVec);
    } else {
      // Gentle camera sway
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.mouse.x * 2), 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.mouse.y * 1), 0.05);
      state.camera.position.z = 5;
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

export default function Scene() {
  const [teleportTarget, setTeleportTarget] = useState<any>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 2]} // Support for high DPI (4k)
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#02000a"]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.2} color="#a0c0ff" />
      
      <IslandGroup setTeleportTarget={setTeleportTarget} teleportTarget={teleportTarget} />

      <CameraController target={teleportTarget} />
      
      {/* Teleportation warp effect overlay */}
      {teleportTarget && (
        <TeleportFade target={teleportTarget} />
      )}
    </Canvas>
  );
}

function TeleportFade({ target }: { target: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current && materialRef.current && target) {
      // Soul going to heaven animation: ascend rapidly
      state.camera.position.y += delta * 20;
      
      meshRef.current.position.set(state.camera.position.x, state.camera.position.y, state.camera.position.z - 0.2);
      
      if (materialRef.current.opacity < 1) {
        materialRef.current.opacity += delta * 1.5;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[5, 5]} />
      {/* Blinding white/cyan light */}
      <meshBasicMaterial ref={materialRef} color="#e0ffff" transparent opacity={0} depthTest={false} toneMapped={false} />
    </mesh>
  );
}
