import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { staticFile } from "remotion";

interface Phone3DMeshProps {
  screenTexturePath?: string;
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: number;
  titaniumColor?: string;
}

export const Phone3DMesh: React.FC<Phone3DMeshProps> = ({
  screenTexturePath = "assets/hedge/phone_mockup.png",
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1,
  titaniumColor = "#2A2A2E",
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // Load screen texture
  const texture = useMemo(() => {
    try {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(staticFile(screenTexturePath));
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    } catch {
      return null;
    }
  }, [screenTexturePath]);

  // Rounded box phone dimensions
  const phoneWidth = 1.8;
  const phoneHeight = 3.8;
  const phoneDepth = 0.18;

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* 1. Titanium Chassis Body (Extruded Rounded Body) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[phoneWidth, phoneHeight, phoneDepth]} />
        <meshStandardMaterial
          color={titaniumColor}
          metalness={0.92}
          roughness={0.24}
        />
      </mesh>

      {/* 2. Beveled Metallic Rim Accent (Slightly larger frame for rim reflection) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[phoneWidth + 0.04, phoneHeight + 0.04, phoneDepth * 0.7]} />
        <meshStandardMaterial
          color="#3E3E44"
          metalness={0.95}
          roughness={0.18}
        />
      </mesh>

      {/* 3. Screen Face with High-Res Texture */}
      <mesh position={[0, 0, phoneDepth / 2 + 0.002]}>
        <planeGeometry args={[phoneWidth - 0.08, phoneHeight - 0.08]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#0A0A0C" roughness={0.1} />
        )}
      </mesh>

      {/* 4. Specular Glass Glare Layer (Catching studio key/rim lights) */}
      <mesh position={[0, 0, phoneDepth / 2 + 0.005]}>
        <planeGeometry args={[phoneWidth - 0.08, phoneHeight - 0.08]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.1}
          transmission={0.9}
          reflectivity={0.95}
        />
      </mesh>

      {/* 5. Dynamic Island Pill */}
      <mesh position={[0, phoneHeight / 2 - 0.35, phoneDepth / 2 + 0.008]}>
        <capsuleGeometry args={[0.07, 0.32, 8, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
};
