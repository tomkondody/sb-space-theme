"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Stars, Sparkles, useTexture, Float, Text, shaderMaterial, Line } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";

const CutoutMaterial = shaderMaterial(
  { uMap: new THREE.Texture(), uHover: 0 },
  // vertex shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader
  `
  uniform sampler2D uMap;
  uniform float uHover;
  varying vec2 vUv;
  
  void main() {
    vec4 color = texture2D(uMap, vUv);
    
    // Calculate brightness to detect black background
    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Discard almost black pixels to physically cut out the shape
    if (brightness < 0.12) {
      discard;
    }
    
    // Smooth the edges slightly (optional, but discard makes a hard edge)
    // Apply hover brightness
    vec3 finalColor = color.rgb + vec3(uHover * 0.15);
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

// Register it with R3F
extend({ CutoutMaterial });

const ISLANDS = [
  { id: "crystal", url: "/island_crystal.jpg", name: "ABOUT", color: "#a020f0" },
  { id: "nature", url: "/island_nature.jpg", name: "EVENTS", color: "#20f0a0" },
  { id: "fire", url: "/island_fire.jpg", name: "MAP", color: "#f05020" },
  { id: "water", url: "/island_water.jpg", name: "CONTACT", color: "#20a0f0" },
];

function Island({ data, size, isTeleporting, setTeleportTarget }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.url);
  const [hovered, setHover] = useState(false);
  const router = useRouter();
  
  // No more basic material or AdditiveBlending. 
  // We use our custom CutoutMaterial in the JSX below.

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
        {/* Animated glowing objects specific to each realm's color (No images!) */}
        <Sparkles 
          count={60} 
          scale={size * 1.5} 
          size={3} 
          speed={hovered ? 0.8 : 0.3} 
          opacity={hovered ? 1 : 0.5} 
          color={data.color} 
        />
        {/* Soft magical glow emitted from the island */}
        <pointLight intensity={hovered ? 1.5 : 0.5} color={data.color} distance={size * 2} />

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
          {/* @ts-ignore */}
          <cutoutMaterial uMap={texture} uHover={hovered ? 1 : 0} transparent={true} />
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
  
  // Dynamic island size: Reduced by 5% on laptop view (2.25)
  const size = isMobile ? Math.max(viewport.width * 0.35, 1.2) : 2.25;
  
  // On mobile, shift slightly down to avoid title
  const yOffset = isMobile ? -viewport.height * 0.08 : 0;
  
  // Explicitly calculate layout instead of using strict pentagon angles
  // This gives perfect control to frame the title and bring the bottom up.
  
  // Top islands: pushed wide to the sides, and raised (beside the title)
  const topX = viewport.width * (isMobile ? 0.28 : 0.32);
  const topY = viewport.height * (isMobile ? 0.25 : 0.25); 

  // Bottom islands: moved a little bit below on laptop, but name remains safely visible
  const bottomX = viewport.width * (isMobile ? 0.24 : 0.22);
  const bottomY = viewport.height * (isMobile ? -0.1 : -0.20);

  const dynamicIslands = [
    // Reduced Z depth variation so they don't block each other
    { ...ISLANDS[0], position: [-bottomX, bottomY + yOffset, 0] }, // Bottom Left (ABOUT)
    { ...ISLANDS[1], position: [-topX, topY + yOffset, -0.2] }, // Top Left (EVENTS)
    { ...ISLANDS[2], position: [topX, topY + yOffset, -0.2] }, // Top Right (MAP)
    { ...ISLANDS[3], position: [bottomX, bottomY + yOffset, 0] }, // Bottom Right (CONTACT)
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

function Constellations() {
  // Generate random constellation lines purely mathematically (no images)
  const constellations = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 25;
      const startY = (Math.random() - 0.5) * 15;
      const startZ = -15 - Math.random() * 10; // Deep background
      points.push(new THREE.Vector3(startX, startY, startZ));
      
      let currX = startX;
      let currY = startY;
      let currZ = startZ;
      
      const numStars = 2 + Math.floor(Math.random() * 4);
      for (let j = 0; j < numStars; j++) {
        currX += (Math.random() - 0.5) * 6;
        currY += (Math.random() - 0.5) * 6;
        currZ += (Math.random() - 0.5) * 3;
        points.push(new THREE.Vector3(currX, currY, currZ));
      }
      arr.push(points);
    }
    return arr;
  }, []);

  return (
    <group>
      {constellations.map((points, idx) => (
        <group key={idx}>
          <Line 
            points={points} 
            color="#80a0ff" 
            opacity={0.15} 
            transparent 
            lineWidth={0.5} 
          />
          {points.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
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
      
      {/* Deep space background elements */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={300} scale={15} size={2} speed={0.4} opacity={0.2} color="#a0c0ff" />
      <Constellations />
      
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
