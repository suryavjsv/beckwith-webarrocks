import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import isMobile from "is-mobile";

// import main helper:
import threeHelper from "./contrib/WebARRocksObject/helpers/WebARRocksObjectThreeHelper.js";

// import mediaStream API helper:
import mediaStreamAPIHelper from "./contrib/WebARRocksObject/helpers/WebARRocksMediaStreamAPIHelper.js";

// import neural network model:
import NN from "./assets/neuralNets/BeckWith2L_70K_2025-09-02.json";

// import ObjectFollower 3D object:
import ObjectFollower from "./3DComponents/ObjectFollower";

// import Guideline overlay:
import Guideline from "./components/Guideline";

// import numbered hotspot
import HotspotWithNumber from "./components/HotspotWithNumber";

let _threeFiber = null;

// fake component, display nothing
// just used to get the Camera and the renderer used by React-fiber:
const ThreeGrabber = (props) => {
  const threeFiber = useThree();
  _threeFiber = threeFiber;
  useFrame(() => {
    threeHelper.update_threeCamera(props.sizing, threeFiber.camera);
    threeHelper.update_poses(threeFiber.camera);
  });
  return null;
};

const compute_sizing = () => {
  const height = screen.availHeight;
  const wWidth = window.innerWidth;
  const width = Math.min(wWidth, height);

  const top = 0;
  const left = Math.max(0, (wWidth - width) * 0.5);
  return { width, height, top, left };
};

// helper to generate random hotspot positions
const generateHotspotPositions = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 0.5, // X spread
      Math.random() * 0.8 + 0.2, // Y above base
      (Math.random() - 0.5) * 0.5, // Z spread
    ],
    number: i + 1,
  }));
};

const ARApp = () => {
  const [sizing, setSizing] = useState(compute_sizing());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSelfieCam, setIsSelfieCam] = useState(!isMobile());
  const [isDisplayGuideline, setIsDisplayGuideline] = useState(true);

  // create hotspots once
  const [hotspots] = useState(generateHotspotPositions(5));

  // refs:
  const canvasComputeRef = useRef();
  const cameraVideoRef = useRef();

  const _settings = {
    nDetectsPerLoop: 0, // 0 -> adaptive

    loadNNOptions: {
      notHereFactor: 0.0,
      paramsPerLabel: {
        LIGHTER: {
          thresholdDetect: 1.0,
        },
      },
    },

    detectOptions: {
      isKeepTracking: true,
      isSkipConfirmation: false,
      thresholdDetectFactor: 1.2,
      thresholdDetectFactorUnstitch: 0.5,
      trackingFactors: [0.6, 0.6, 0.6],
    },

    cameraFov: 0, // auto evaluation
    scanSettings: {
      nScaleLevels: 3,
      overlapFactors: [3, 3, 3],
      scale0Factor: 0.5,
    },

    followZRot: false,
  };
  let _timerResize = null;

  const handle_resize = () => {
    if (_timerResize) clearTimeout(_timerResize);
    _timerResize = setTimeout(do_resize, 200);
  };

  const do_resize = () => {
    _timerResize = null;
    const newSizing = compute_sizing();
    setSizing(newSizing);
  };

  useEffect(() => {
    if (!_timerResize && _threeFiber && _threeFiber.gl) {
      _threeFiber.gl.setSize(sizing.width, sizing.height, true);
    }
  }, [sizing]);

  useEffect(() => {
    const onCameraVideoFeedGot = () => {
      if (!cameraVideoRef.current || !canvasComputeRef.current) {
        console.error("Refs not ready");
        return;
      }
      threeHelper.init({
        video: cameraVideoRef.current,
        ARCanvas: canvasComputeRef.current,
        NN,
        sizing,
        callbackReady: () => {
          window.addEventListener("resize", handle_resize);
          window.addEventListener("orientationchange", handle_resize);
          setIsInitialized(true);
          threeHelper.set_callback("beckWith", "onloose", () => {
            console.log("beckWith DETECTION LOST");
          });
          threeHelper.set_callback("beckWith", "ondetect", () => {
            console.log("beckWith DETECTED");
            setIsDisplayGuideline(false);
          });
        },
        loadNNOptions: _settings.loadNNOptions,
        nDetectsPerLoop: _settings.nDetectsPerLoop,
        detectOptions: _settings.detectOptions,
        cameraFov: _settings.cameraFov,
        followZRot: _settings.followZRot,
        scanSettings: _settings.scanSettings,
        stabilizerOptions: { n: 3 },
      });
    };

    mediaStreamAPIHelper.get(
      cameraVideoRef.current,
      onCameraVideoFeedGot,
      (err) => {
        console.error("Cannot get video feed " + err);
      },
      {
        video: {
          width: { min: 640, max: 1280, ideal: 1280 },
          height: { min: 640, max: 1280, ideal: 720 },
          facingMode: { ideal: "environment" },
        },
        audio: false,
      }
    );

    return threeHelper.destroy;
  }, []);

  const commonStyle = {
    width: sizing.width,
    height: sizing.height,
    top: sizing.top,
    left: sizing.left,
    position: "fixed",
    objectFit: "cover",
  };

  const ARCanvasStyle = { ...commonStyle, zIndex: 2 };
  const cameraVideoStyle = { ...commonStyle, zIndex: 1 };

  const mirrorClass = isSelfieCam ? "mirrorX" : "";

  return (
    <div>
      {isDisplayGuideline && (
        <Guideline onClose={() => setIsDisplayGuideline(false)} />
      )}

      {/* Canvas managed by three fiber, for AR */}
      <Canvas
        style={ARCanvasStyle}
        className={mirrorClass}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ThreeGrabber sizing={sizing} />

        <ObjectFollower
          label="beckWith"
          threeHelper={threeHelper}
          isInitialized={isInitialized}
        >
          {isInitialized &&
            hotspots.map((h, idx) => (
              <HotspotWithNumber
                key={idx}
                position={h.position}
                number={h.number}
              />
            ))}
        </ObjectFollower>
      </Canvas>

      {/* Video */}
      <video
        style={cameraVideoStyle}
        ref={cameraVideoRef}
        className={mirrorClass}
      ></video>

      {/* Hidden canvas for WebAR.rocks.object computations */}
      <canvas
        ref={canvasComputeRef}
        style={{ display: "none" }}
        width={512}
        height={512}
      />
    </div>
  );
};

export default ARApp;
