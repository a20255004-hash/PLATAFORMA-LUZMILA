import { Center, Float, PresentationControls, Text3D, Billboard } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { letraDe } from '../data/letras'

const C = { tinta: '#12302a', lima: '#4fd08f', hielo: '#f4fbf6', lila: '#c3adff', mandarina: '#ff9d57', celeste: '#86d6ff', rosa: '#ffb3d1', mostaza: '#ffd25e', menta: '#8fe5b8', crema: '#e6f6ec' }
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

function Escena({ fotos, nombre, letra }: { fotos: string[]; nombre: string; letra?: string }) {
  const [fuente, setFuente] = useState<any>(null)
  const [ancho, setAncho] = useState(0)
  useEffect(() => { let v = true; setFuente(null); setAncho(0); letraDe(letra).f3d().then((m: any) => v && setFuente(m.default || m)); return () => { v = false } }, [letra])
  const grupo = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const alto = viewport.width < 7 // celular vertical
  const escala = Math.min(1, viewport.width / (alto ? 8.8 : 13.2))
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
        {fuente && (
          <group scale={ancho ? Math.min(1, (viewport.width / escala * 0.8) / ancho) : 0.0001}>
          <Center key={letra} onCentered={({ width }) => setAncho(width)}>
            <Text3D font={fuente} size={alto ? 1.5 : 2.3} height={0.55} bevelEnabled bevelSize={0.035} bevelThickness={0.05} bevelSegments={4} curveSegments={10} letterSpacing={0.02}>
              {nombre}
              <meshStandardMaterial attach="material-0" color={C.tinta} roughness={0.3} />
              <meshStandardMaterial attach="material-1" color={C.hielo} roughness={0.5} />
            </Text3D>
          </Center>
          </group>
        )}
        {fotos.slice(0, 5).map((f, i) => <Burbuja key={i} src={f} pos={sitios[i]} r={radios[i] * (alto ? 0.82 : 1)} color={colores[i]} />)}
      </group>
    </PresentationControls>
  )
}

export default function Hero3D({ fotos, nombre, letra }: { fotos: string[]; nombre: string; letra?: string }) {
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
        <Escena fotos={fotos} nombre={nombre} letra={letra} />
      </Canvas>
    </div>
  )
}
