import React, { useMemo } from "react";
import * as THREE from "three";
import { staticFile } from "remotion";

interface Card3DMeshProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  width?: number;
  height?: number;
  depth?: number;
  texturePath?: string;
  cardColor?: string;
  roughness?: number;
  metalness?: number;
}

export const Card3DMesh: React.FC<Card3DMeshProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2.4,
  height = 1.6,
  depth = 0.08,
  texturePath,
  cardColor = "#1C1C1E",
  roughness = 0.35,
  metalness = 0.25,
}) => {
  const texture = useMemo(() => {
    if (!texturePath) return null;
    try {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(staticFile(texturePath));
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    } catch {
      return null;
    }
  }, [texturePath]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Extruded Card Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={cardColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Front Face with Texture or Content */}
      {texture && (
        <mesh position={[0, 0, depth / 2 + 0.001]}>
          <planeGeometry args={[width - 0.04, height - 0.04]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      )}

      {/* Subtle Specular Rim Border */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + 0.02, height + 0.02, depth * 0.5]} />
        <meshStandardMaterial
          color="#3A3A40"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};
