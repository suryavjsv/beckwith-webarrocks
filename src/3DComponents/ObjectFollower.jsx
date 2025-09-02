import { useRef, useEffect } from "react";
import { Edges } from "@react-three/drei";

const ObjectFollower = ({ label, threeHelper, isInitialized, children }) => {
  const objRef = useRef();

  // Register the object with WebAR.rocks helper
  useEffect(() => {
    if (objRef.current && threeHelper) {
      threeHelper.set_objectFollower(label, objRef.current);
      console.log(`ObjectFollower registered for label: ${label}`);
    }
  }, [threeHelper, label]);

  // Toggle visibility once initialized
  useEffect(() => {
    if (isInitialized && objRef.current) {
      objRef.current.visible = true;
    }
  }, [isInitialized]);

  const s = 0.5; // scale of the box

  return (
    <object3D ref={objRef} visible={false}>
      {/* Base box mesh for visual reference */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[s, s, s * 0.5]} />
        <meshBasicMaterial
          color={0xff0000}
          wireframe={true}
          opacity={0}
          transparent={true}
        />
        <Edges
          linewidth={4}
          scale={1}
          threshold={15}
          color={0x00ff00}
        />
      </mesh>

      {/* Hotspots or other children */}
      {children}
    </object3D>
  );
};

export default ObjectFollower;