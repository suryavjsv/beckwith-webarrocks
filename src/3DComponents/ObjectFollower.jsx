import { useRef, useEffect } from "react";

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
  return (
    <object3D ref={objRef} visible={false}>
      {/* Only render children (hotspots, effects, etc.) */}
      {children}
    </object3D>
  );
};

export default ObjectFollower;
