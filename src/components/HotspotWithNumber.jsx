import { Circle, Text } from "@react-three/drei";
const HotspotWithNumber = ({ position, number }) => {
 return (
<group position={position}>
     {/* Yellow 2D circle */}
<Circle args={[0.1, 32]} rotation={[-Math.PI / 2, 0, 0]}>
<meshStandardMaterial color="yellow" />
</Circle>
     {/* Number inside */}
<Text
       position={[0, 0.01, 0]} // slightly above circle
       fontSize={0.15}
       color="black"
       anchorX="center"
       anchorY="middle"
>
       {number}
</Text>
</group>
 );
};
export default HotspotWithNumber;