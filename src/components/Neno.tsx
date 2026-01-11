import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './Neno.css';

export function Neno() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 5, 3);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 创建便签纸堆叠（Neno）
    const stickyColor = 0xFFF9C4; // Sticky Note Yellow
    const notes: THREE.Mesh[] = [];
    const noteCount = 5;
    const thickness = 0.02;

    for (let i = 0; i < noteCount; i++) {
      const geometry = new THREE.BoxGeometry(1.5, 1.8, thickness);
      const material = new THREE.MeshStandardMaterial({
        color: stickyColor,
        roughness: 0.8,
        metalness: 0.1,
      });

      const note = new THREE.Mesh(geometry, material);
      
      // 轻微偏移，营造堆叠效果
      const offset = (i - noteCount / 2) * 0.03;
      note.position.set(offset, offset * 0.5, i * thickness);
      note.rotation.z = (i - noteCount / 2) * 0.05;
      note.rotation.y = (i - noteCount / 2) * 0.02;
      
      note.castShadow = true;
      note.receiveShadow = true;
      scene.add(note);
      notes.push(note);
    }

    // 添加狗耳朵效果（顶部右侧的小折角）
    const earGeometry = new THREE.BoxGeometry(0.15, 0.15, thickness * 2);
    const earMaterial = new THREE.MeshStandardMaterial({
      color: stickyColor,
      roughness: 0.8,
    });
    
    const ear = new THREE.Mesh(earGeometry, earMaterial);
    ear.position.set(0.6, 0.8, noteCount * thickness);
    ear.rotation.z = Math.PI / 4;
    ear.rotation.y = Math.PI / 6;
    ear.castShadow = true;
    scene.add(ear);

    // 添加地面（用于阴影）
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // 动画循环
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // 轻微的浮动动画
      notes.forEach((note, i) => {
        note.position.y += Math.sin(time + i) * 0.0005;
        note.rotation.z += Math.cos(time + i * 0.5) * 0.0002;
      });

      ear.position.y = 0.8 + Math.sin(time) * 0.01;
      ear.rotation.z = Math.PI / 4 + Math.cos(time * 0.5) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        try {
          if (containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
        } catch (e) {
          // 忽略移除错误
        }
      }
      renderer.dispose();
      notes.forEach(note => {
        note.geometry.dispose();
        if (note.material instanceof THREE.Material) {
          note.material.dispose();
        }
      });
      ear.geometry.dispose();
      if (ear.material instanceof THREE.Material) {
        ear.material.dispose();
      }
      ground.geometry.dispose();
      if (ground.material instanceof THREE.Material) {
        ground.material.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="neno-canvas" />;
}
