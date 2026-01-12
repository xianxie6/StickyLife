import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { MascotStage, useMascotState } from '../hooks/useMascotState';

export interface MascotContainerProps {
  currentWeek: number;
  completionRate: number; // 0 - 1
  overdueCount: number;
  className?: string;
  isDocked?: boolean; // 是否停靠状态（睡眠）
}

interface StageMeshProps {
  stage: MascotStage;
  transition: number; // 0 - 1, 用于淡入淡出/缩放
  isDocked?: boolean; // 是否停靠（睡眠状态）
}

function EmbryoMesh({ transition, isDocked }: StageMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [jellyScale, setJellyScale] = useState(1);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    if (isDocked) {
      // 睡眠状态：轻微呼吸动画
      meshRef.current.position.y = Math.sin(t * 0.8) * 0.05;
      meshRef.current.scale.setScalar(transition * 0.8);
    } else {
      // 正常状态：轻微上下浮动
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.15;
      // 点击后的果冻回弹
      const targetScale = 1;
      const lerpFactor = 0.1;
      const s = THREE.MathUtils.lerp(jellyScale, targetScale, lerpFactor);
      setJellyScale(s);
      meshRef.current.scale.setScalar(transition * s);
    }
  });

  const handleClick = () => {
    setJellyScale(1.3);
  };

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial
        color="#f48fb1" // 粉色
        transparent
        opacity={0.7 * transition}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

function HappyMesh({ transition, isDocked }: StageMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lookTarget = useRef<THREE.Vector3 | null>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    if (isDocked) {
      // 睡眠状态：轻微呼吸动画，不移动
      meshRef.current.position.set(0, Math.sin(t * 0.8) * 0.05, 0);
      meshRef.current.rotation.y = 0;
      meshRef.current.scale.setScalar(transition * 0.8);
    } else {
      // 正常状态：环绕游动
      const radius = 1;
      meshRef.current.position.x = Math.cos(t * 0.6) * radius;
      meshRef.current.position.y = Math.sin(t * 0.6) * 0.2;
      meshRef.current.position.z = Math.sin(t * 0.6) * radius;

      // 轻微自转
      meshRef.current.rotation.y += 0.01;

      // 看向鼠标的大致方向
      if (lookTarget.current) {
        meshRef.current.lookAt(lookTarget.current);
      }

      meshRef.current.scale.setScalar(transition);
    }
  });

  const handlePointerMove = (event: any) => {
    const point = event.point as THREE.Vector3;
    lookTarget.current = point.clone();
  };

  return (
    <mesh ref={meshRef} onPointerMove={handlePointerMove}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial
        color="#ffb74d" // 橙色
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  );
}

function AnxiousMesh({ transition, isDocked }: StageMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    if (isDocked) {
      // 睡眠状态：轻微呼吸
      meshRef.current.position.set(0, Math.sin(t * 0.8) * 0.05, 0);
      meshRef.current.rotation.z = 0;
      meshRef.current.scale.setScalar(transition * 0.8);
    } else {
      // 正常状态：抖动
      meshRef.current.position.x = Math.sin(t * 15) * 0.08;
      meshRef.current.position.y = Math.sin(t * 13) * 0.08;
      meshRef.current.rotation.z = Math.sin(t * 20) * 0.1;
      meshRef.current.scale.setScalar(transition * 1.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial
        color="#8d6e63" // 灰褐色
        roughness={0.8}
        metalness={0.05}
      />
    </mesh>
  );
}

function KingMesh({ transition, isDocked }: StageMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isDocked) {
      // 睡眠状态：轻微呼吸
      groupRef.current.position.set(0, Math.sin(t * 0.8) * 0.05, 0);
      groupRef.current.rotation.y = 0;
      groupRef.current.scale.setScalar(transition * 0.8);
    } else {
      // 正常状态：巡游轨迹
      const radius = 1.2;
      groupRef.current.position.x = Math.cos(t * 0.5) * radius;
      groupRef.current.position.z = Math.sin(t * 0.5) * radius;
      groupRef.current.position.y = 0.3 + Math.sin(t * 1.2) * 0.15;

      groupRef.current.rotation.y += 0.01;
      groupRef.current.scale.setScalar(transition * 1.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 本体 */}
      <mesh>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial
          color="#ffd54f" // 金色
          roughness={0.3}
          metalness={0.6}
          emissive="#ffe082"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 简单皇冠占位 */}
      <mesh position={[0, 0.75, 0]}>
        <coneGeometry args={[0.4, 0.3, 16]} />
        <meshStandardMaterial
          color="#ffeb3b"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function MascotStageMesh({ stage, transition, isDocked }: StageMeshProps) {
  if (stage === 'embryo') return <EmbryoMesh stage={stage} transition={transition} isDocked={isDocked} />;
  if (stage === 'happy') return <HappyMesh stage={stage} transition={transition} isDocked={isDocked} />;
  if (stage === 'anxious') return <AnxiousMesh stage={stage} transition={transition} isDocked={isDocked} />;
  return <KingMesh stage={stage} transition={transition} isDocked={isDocked} />;
}

export function MascotContainer({
  currentWeek,
  completionRate,
  overdueCount,
  className,
  isDocked = false,
}: MascotContainerProps) {
  // 使用 useMascotState hook（hooks 必须在组件顶层调用）
  const mascot = useMascotState({ currentWeek, completionRate, overdueCount });
  const [displayStage, setDisplayStage] = useState<MascotStage>(mascot.stage);
  const [transition, setTransition] = useState(1); // 0->1 淡入

  // 平滑过渡：先淡出旧阶段，再切换并淡入新阶段
  useEffect(() => {
    if (mascot.stage === displayStage) {
      // 确保 transition 是 1（完全显示）
      if (transition < 1) {
        setTransition(1);
      }
      return;
    }

    // 状态变化时触发过渡动画
    setTransition(0);
    const timeoutOut = setTimeout(() => {
      setDisplayStage(mascot.stage);
      // 延迟一点再开始淡入，让切换更平滑
      setTimeout(() => {
        setTransition(1);
      }, 50);
    }, 200);

    return () => {
      clearTimeout(timeoutOut);
    };
  }, [mascot.stage, displayStage, transition]);

  const showAnxiousBubble = mascot.stage === 'anxious';

  return (
    <div
      className={className ?? 'relative w-full h-64 glass-surface rounded-3xl overflow-hidden'}
    >
      {typeof window !== 'undefined' && (
        <Canvas
          camera={{ position: [0, 0.8, 4], fov: 40 }}
          dpr={window.devicePixelRatio || 1}
          gl={{ alpha: true }}
        >

        {/* 灯光 */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={0.9}
          castShadow
        />

        {/* 地面柔和阴影 */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -1, 0]} receiveShadow>
          <circleGeometry args={[5, 32]} />
          <shadowMaterial opacity={0.2} />
        </mesh>

        <MascotStageMesh 
          stage={displayStage} 
          transition={transition} 
          isDocked={isDocked}
        />

        <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      )}

      {/* 焦虑气泡提示 */}
      {showAnxiousBubble && (
        <div className="absolute right-4 top-4 max-w-xs rounded-2xl bg-white/80 text-sm text-rose-600 px-3 py-2 shadow-lg paper-texture">
          {mascot.helperMessage}
        </div>
      )}

      {/* 底部辅助文案 */}
      {mascot.helperMessage && !showAnxiousBubble && (
        <div className="absolute left-4 bottom-3 text-xs text-slate-700/80">
          {mascot.helperMessage}
        </div>
      )}

      {/* 调试信息（开发时可见，生产环境可隐藏） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute left-4 top-4 text-xs bg-black/60 text-white px-2 py-1 rounded font-mono">
          <div>周: {currentWeek} | 完成: {(completionRate * 100).toFixed(0)}% | 逾期: {overdueCount}</div>
          <div>状态: {mascot.stage} | 动画: {mascot.baseAnimation}</div>
        </div>
      )}
    </div>
  );
}

