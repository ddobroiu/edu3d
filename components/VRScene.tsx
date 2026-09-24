"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, Grid, OrbitControls, useGLTF } from "@react-three/drei";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import { Headset } from "lucide-react";

const store = createXRStore();

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // `Center` pune modelul in origine indiferent cum a fost exportat,
  // altfel unele GLB-uri apar sub podea sau in spatele privitorului.
  return (
    <Center top>
      <primitive object={scene} scale={1.5} />
    </Center>
  );
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#8b74ff" wireframe />
    </mesh>
  );
}

export default function VRScene({ url, alt }: { url: string; alt: string }) {
  const [vrSupported, setVrSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const xr = (navigator as Navigator & { xr?: { isSessionSupported(mode: string): Promise<boolean> } }).xr;
    if (!xr) {
      setVrSupported(false);
      return;
    }
    xr.isSessionSupported("immersive-vr")
      .then(setVrSupported)
      .catch(() => setVrSupported(false));
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#12102b]">
      <Canvas camera={{ position: [0, 1.6, 3.5], fov: 50 }} shadows>
        <XR store={store}>
          {/* Privitorul sta in picioare la 1.6 m, inaltime naturala pentru un adult. */}
          <XROrigin position={[0, 0, 2]} />

          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 8, 4]} intensity={1.4} castShadow />
          <Environment preset="city" />

          <Suspense fallback={<Loader />}>
            <Model url={url} />
          </Suspense>

          <Grid
            args={[20, 20]}
            cellColor="#3d1da6"
            sectionColor="#6d4aff"
            position={[0, -0.01, 0]}
            fadeDistance={18}
            infiniteGrid
          />

          <OrbitControls makeDefault target={[0, 0.8, 0]} enablePan={false} minDistance={1.2} maxDistance={8} />
        </XR>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4">
        {vrSupported ? (
          <button onClick={() => store.enterVR()} className="btn-sun pointer-events-auto">
            <Headset size={20} aria-hidden />
            Intra in VR
          </button>
        ) : vrSupported === false ? (
          <p className="rounded-2xl bg-black/50 px-4 py-2 text-center text-sm text-white">
            Casca VR nu este detectata. Poti roti modelul cu mouse-ul sau cu degetul, iar de pe
            telefon il poti vedea in camera ta.
          </p>
        ) : null}
        <p className="sr-only">{alt}</p>
      </div>
    </div>
  );
}
