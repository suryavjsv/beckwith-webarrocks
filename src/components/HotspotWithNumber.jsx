import { Text } from "@react-three/drei";
const HotspotWithNumber = ({ position, number }) => {
 return (
<group position={position}>
     {/* Yellow circle */}
<mesh rotation={[0, 0, 0]}> {/* flat, no upside-down rotation */}
<circleGeometry args={[0.1, 32]} />
<meshBasicMaterial color="yellow" /> {/* always visible */}
</mesh>
     {/* Number inside */}
<Text
       position={[0, 0, 0.01]} // slightly above the circle
       fontSize={0.15}
       color="white"
       anchorX="center"
       anchorY="middle"
>
       {number}
</Text>
</group>
 );
};
export default HotspotWithNumber;