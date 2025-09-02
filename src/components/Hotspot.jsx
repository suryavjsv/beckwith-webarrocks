// Hotspot.jsx

const Hotspot = ({ position, onClick }) => {
  return (
    <mesh position={position} onClick={onClick}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

export default Hotspot;
