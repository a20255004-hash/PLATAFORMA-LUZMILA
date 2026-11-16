import { Center, Float, PresentationControls, Text3D, Billboard } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import fuente from '../data/fuente3d.json'

const C = { tinta: '#2a1b3d', lima: '#c9f25c', lila: '#c3adff', mandarina: '#ff9d57', celeste: '#86d6ff', rosa: '#ffb3d1', mostaza: '#ffd25e', menta: '#8fe5b8', crema: '#fbf7f0' }
const mat = (color: string, extra: any = {}) => <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} {...extra} />

function Burbuja({ src, pos, r, color }: { src: string; pos: [number, number, number]; r: number; color: string }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let vivo = true
    const img = new Image()
    img.onload = () => {
      // Recorte cuadrado (un poco hacia arriba, donde suele estar la cara) dibujado en un lienzo.
      const lado = Math.min(img.width, img.height), c = document.createElement('canvas')
      c.width = c.height = 512
      const sx = (img.width - lado) / 2, sy = Math.max(0, (img.height - lado) * 0.28)
      c.getContext('2d')!.drawImage(img, sx, sy, lado, lado, 0, 0, 512, 512)
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
      if (vivo) setTex(t)
    }
    img.src = src
    return () => { vivo = false }
  }, [src])
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={1.2} position={pos}>
      <Billboard>
        <mesh><circleGeometry args={[r, 64]} />{tex ? <meshBasicMaterial key="foto" color="#ffffff" map={tex} toneMapped={false} /> : <meshBasicMaterial key="vacio" color={C.crema} />}</mesh>
        <mesh><torusGeometry args={[r, r * 0.075, 16, 80]} />{mat(color)}</mesh>
      </Billboard>
      <mesh><sphereGeometry args={[r * 1.12, 32, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} /></mesh>
    </Float>
  )
}

function Gira({ children, v = 0.3 }: any) {
  const g = useRef<THREE.Group>(null)
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * v })
  return <group ref={g}>{children}</group>
}

const Manzanita = (p: any) => (
  <Float speed={2} floatIntensity={1.4} rotationIntensity={0.8} {...p}>
    <mesh scale={[1, 0.92, 1]}><sphereGeometry args={[0.42, 32, 32]} />{mat(C.lima)}</mesh>
    <mesh position={[0, 0.44, 0]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.03, 0.04, 0.22, 8]} />{mat(C.tinta)}</mesh>
    <mesh position={[0.14, 0.5, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.45, 0.25]}><sphereGeometry args={[0.16, 16, 16]} />{mat(C.menta)}</mesh>
  </Float>
)
const Corona = (p: any) => (
  <Float speed={1.6} floatIntensity={1.2} rotationIntensity={0.6} {...p}>
    <Gira>
      <mesh><cylinderGeometry args={[0.42, 0.36, 0.26, 28, 1, true]} />{mat(C.mostaza, { side: THREE.DoubleSide })}</mesh>
      {[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 0.4, 0.27, Math.sin(a) * 0.4]}><coneGeometry args={[0.1, 0.3, 12]} />{mat(C.mostaza)}</mesh> })}
    </Gira>
  </Float>
)
const Avioncito = (p: any) => (
  <Float speed={2.4} floatIntensity={2} rotationIntensity={1} {...p}>
    <mesh rotation={[0.3, 0.4, -1.2]} scale={[1, 1, 0.22]}><coneGeometry args={[0.36, 0.95, 3]} />{mat('#ffffff', { roughness: 0.6 })}</mesh>
  </Float>
)
const Zorrito = (p: any) => (
  <Float speed={1.8} floatIntensity={1.3} rotationIntensity={0.5} {...p}>
    <mesh rotation={[Math.PI, Math.PI / 4, 0]} scale={[1, 1, 0.8]}><coneGeometry args={[0.5, 0.72, 4]} />{mat(C.mandarina, { flatShading: true })}</mesh>
    <mesh position={[-0.27, 0.44, 0]} rotation={[0, 0, 0.28]}><coneGeometry args={[0.15, 0.36, 4]} />{mat(C.mandarina, { flatShading: true })}</mesh>
    <mesh position={[0.27, 0.44, 0]} rotation={[0, 0, -0.28]}><coneGeometry args={[0.15, 0.36, 4]} />{mat(C.mandarina, { flatShading: true })}</mesh>
    <mesh position={[0, -0.2, 0.2]}><sphereGeometry args={[0.15, 12, 12]} />{mat('#ffffff')}</mesh>
    <mesh position={[0, -0.27, 0.34]}><sphereGeometry args={[0.055, 12, 12]} />{mat(C.tinta)}</mesh>
    <mesh position={[-0.15, 0.08, 0.3]}><sphereGeometry args={[0.045, 12, 12]} />{mat(C.tinta)}</mesh>
    <mesh position={[0.15, 0.08, 0.3]}><sphereGeometry args={[0.045, 12, 12]} />{mat(C.tinta)}</mesh>
  </Float>
)
const Lupa = (p: any) => (
  <Float speed={1.5} floatIntensity={1.2} rotationIntensity={0.9} {...p}>
    <mesh><torusGeometry args={[0.3, 0.06, 16, 48]} />{mat(C.rosa)}</mesh>
    <mesh><circleGeometry args={[0.28, 40]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} clearcoat={1} roughness={0} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.34, -0.34, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.05, 0.05, 0.42, 12]} />{mat(C.tinta)}</mesh>
  </Float>
)

function Escena({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const grupo = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const alto = viewport.width < 7 // celular vertical
  const escala = Math.min(1, viewport.width / (alto ? 7.4 : 12.5))
  useFrame((s) => {
    if (!grupo.current) return
    grupo.current.rotation.y = THREE.MathUtils.lerp(grupo.current.rotation.y, s.pointer.x * 0.28, 0.05)
    grupo.current.rotation.x = THREE.MathUtils.lerp(grupo.current.rotation.x, -s.pointer.y * 0.16, 0.05)
  })
  const sitios = useMemo<[number, number, number][]>(() => alto
    ? [[-1.5, 2.3, 0.9], [1.7, 2.2, -1], [-1.9, -2.4, -0.8], [1.6, -2.9, 1], [0.1, 3.9, -1.4]]
    : [[-3.3, 1.15, 1.1], [3.3, 1.7, -1.1], [-1.2, -1.75, 1.3], [4.4, -1.2, 0.9], [0.9, 2.2, -1.6]], [alto])
  const radios = [0.98, 0.86, 0.74, 0.7, 0.62]
  const colores = [C.lima, C.lila, C.mandarina, C.celeste, C.rosa]
  return (
    <PresentationControls global={false} cursor snap speed={1.4} polar={[-0.3, 0.3]} azimuth={[-0.7, 0.7]}>
      <group ref={grupo} scale={escala}>
        <Center>
          <Text3D font={fuente as any} size={alto ? 1.25 : 1.9} height={0.55} bevelEnabled bevelSize={0.035} bevelThickness={0.05} bevelSegments={4} curveSegments={10} letterSpacing={-0.04}>
            {nombre.toUpperCase()}
            <meshStandardMaterial attach="material-0" color={C.tinta} roughness={0.3} />
            <meshStandardMaterial attach="material-1" color={C.lima} roughness={0.45} />
          </Text3D>
        </Center>
        {fotos.slice(0, 5).map((f, i) => <Burbuja key={i} src={f} pos={sitios[i]} r={radios[i] * (alto ? 0.82 : 1)} color={colores[i]} />)}
        <Float speed={1} floatIntensity={0.8} position={alto ? [1.7, -1.2, -1.6] : [-5, -1.3, -1.5]}>
          <Gira v={0.25}><mesh><icosahedronGeometry args={[0.95, 1]} /><meshBasicMaterial color={C.tinta} wireframe transparent opacity={0.55} /></mesh></Gira>
        </Float>
        <Float speed={1.3} floatIntensity={1} position={alto ? [-1.8, 1.1, 1.2] : [2, -1.9, 1.5]}><mesh><sphereGeometry args={[0.36, 32, 32]} /><meshPhysicalMaterial color={C.lila} roughness={0.1} clearcoat={1} /></mesh></Float>
        <Float speed={1.1} floatIntensity={1.4} position={alto ? [1.9, 0.9, 1] : [-2.4, 2.2, -0.9]}><Gira v={0.6}><mesh rotation={[1, 0.4, 0]}><torusGeometry args={[0.36, 0.11, 20, 60]} />{mat(C.celeste)}</mesh></Gira></Float>
        <Manzanita position={alto ? [-1.9, -0.9, 1.3] : [-4.9, 0.2, 1.4]} />
        <Corona position={alto ? [0.2, -3.9, 0.6] : [5.3, 0.6, -0.4]} />
        <Avioncito position={alto ? [1.9, 3.6, 0.8] : [1.9, 2.5, 1.2]} />
        <Zorrito position={alto ? [-0.3, 1.9, 1.6] : [-2.9, -1.2, 1.6]} />
        <Lupa position={alto ? [1.2, -1.9, 1.4] : [3.1, -0.2, 1.7]} />
      </group>
    </PresentationControls>
  )
}

export default function Hero3D({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const caja = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 })
    if (caja.current) o.observe(caja.current)
    return () => o.disconnect()
  }, [])
  return (
    <div className="hero-3d" ref={caja} aria-hidden="true">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 11], fov: 36 }} frameloop={visible ? 'always' : 'never'} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 6, 8]} intensity={2.4} />
        <directionalLight position={[-6, -2, 4]} intensity={0.8} color={C.rosa} />
        <pointLight position={[0, 3, 6]} intensity={30} color="#fff6e0" />
        <Escena fotos={fotos} nombre={nombre} />
      </Canvas>
    </div>
  )
}
