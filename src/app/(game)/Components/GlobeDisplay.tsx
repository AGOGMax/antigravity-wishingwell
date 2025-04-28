"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Tween, Easing, Group } from "@tweenjs/tween.js";

type GlobeRouletteProps = {
  numbers: number[];
  isSpinning: boolean;
  eliminations: number[];
  totalParticipants: number;
};

type Spot = {
  number: number | "";
  sprite: THREE.Sprite;
  originalPosition: THREE.Vector3;
};

export default function GlobeRoulette({
  numbers,
  isSpinning,
  eliminations,
  totalParticipants,
}: GlobeRouletteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const activeSpotsRef = useRef<Spot[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const tweenGroupRef = useRef<Group>(new Group());
  const isSpinningRef = useRef<boolean>(false);

  const [globeNumbers, setGlobeNumbers] = useState<(number | "")[]>([]);

  useEffect(() => {
    setGlobeNumbers(
      Array.from({ length: totalParticipants }, (_, i) =>
        numbers.includes(i + 1) ? i + 1 : "",
      ),
    );
  }, [numbers]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 5, 28);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 15;
    controls.maxDistance = 50;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(-10, -10, 10);
    scene.add(pointLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 10;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b0764,
      shininess: 30,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    const glowGeometry = new THREE.SphereGeometry(globeRadius + 0.8, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: false,
      opacity: 0.3,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowMesh);

    const createNumberSprite = (number: number | "") => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const size = 128;
      canvas.width = size;
      canvas.height = size;

      if (context) {
        context.font = `Bold ${size / 2.5}px Arial`;
        context.fillStyle = "rgba(255, 255, 255, 0.95)";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(number.toString(), size / 2, size / 2);
      } else {
        console.warn("Canvas context could not be obtained.");
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      return sprite;
    };

    const updateNumbers = () => {
      // Clear existing spots
      activeSpotsRef.current.forEach((spot) => {
        globeGroup.remove(spot.sprite);
        if (spot.sprite.material.map) spot.sprite.material.map.dispose();
        spot.sprite.material.dispose();
      });
      activeSpotsRef.current = [];

      const numLatitudeLines = 19;
      const numLongitudePoints = 19;
      const latitudeSpacing = Math.PI / (numLatitudeLines + 1);
      const longitudeSpacing = (Math.PI * 2) / numLongitudePoints;
      let spotCounter = 0;

      // First try to evenly distribute numbers
      for (let i = 1; i <= numLatitudeLines; i++) {
        const phi = i * latitudeSpacing;

        for (let j = 0; j < numLongitudePoints; j++) {
          if (spotCounter >= globeNumbers.length) break;

          const theta = j * longitudeSpacing;
          const position = new THREE.Vector3();
          position.setFromSphericalCoords(globeRadius + 0.1, phi, theta);

          const number = globeNumbers[spotCounter];
          const sprite = createNumberSprite(number);
          sprite.position.copy(position);
          sprite.userData.number = number;
          sprite.scale.set(0.8, 0.8, 1);

          globeGroup.add(sprite);

          activeSpotsRef.current.push({
            number: number as number | "",
            sprite: sprite,
            originalPosition: position.clone(),
          });
          spotCounter++;
        }
        if (spotCounter >= globeNumbers.length) break;
      }

      // If we have more numbers than evenly distributed spots, place randomly
      while (spotCounter < globeNumbers.length) {
        const phi = Math.acos(-1 + 2 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        const position = new THREE.Vector3();
        position.setFromSphericalCoords(globeRadius + 0.1, phi, theta);

        const number = globeNumbers[spotCounter];
        const sprite = createNumberSprite(number);
        sprite.position.copy(position);
        sprite.userData.number = number;
        sprite.scale.set(0.8, 0.8, 1);

        globeGroup.add(sprite);

        activeSpotsRef.current.push({
          number: number,
          sprite: sprite,
          originalPosition: position.clone(),
        });
        spotCounter++;
      }
    };

    updateNumbers();

    const animate = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      tweenGroupRef.current.update(time);
      controls.update();
      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current && rendererRef.current.domElement) {
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (activeSpotsRef.current) {
        activeSpotsRef.current.forEach((spot) => {
          if (spot.sprite.material.map) {
            spot.sprite.material.map.dispose();
          }
          spot.sprite.material.dispose();
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!globeGroupRef.current) return;

    const updateNumbers = () => {
      activeSpotsRef.current.forEach((spot) => {
        if (globeGroupRef.current) {
          globeGroupRef.current.remove(spot.sprite);
        }
        if (spot.sprite.material.map) spot.sprite.material.map.dispose();
        spot.sprite.material.dispose();
      });
      activeSpotsRef.current = [];

      const globeRadius = 10;
      const numLatitudeLines = 19;
      const numLongitudePoints = 19;
      const latitudeSpacing = Math.PI / (numLatitudeLines + 1);
      const longitudeSpacing = (Math.PI * 2) / numLongitudePoints;
      let spotCounter = 0;

      const createNumberSprite = (number: number | "") => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const size = 128;
        canvas.width = size;
        canvas.height = size;

        if (context) {
          context.font = `Bold ${size / 2.5}px Arial`;
          context.fillStyle = "rgba(255, 255, 255, 0.95)";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(number.toString(), size / 2, size / 2);
        } else {
          console.warn("Canvas context could not be obtained.");
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        return sprite;
      };

      for (let i = 1; i <= numLatitudeLines; i++) {
        const phi = i * latitudeSpacing;

        for (let j = 0; j < numLongitudePoints; j++) {
          if (spotCounter >= globeNumbers.length) break;

          const theta = j * longitudeSpacing;
          const position = new THREE.Vector3();
          position.setFromSphericalCoords(globeRadius + 0.1, phi, theta);

          const number = globeNumbers[spotCounter];
          const sprite = createNumberSprite(number);
          sprite.position.copy(position);
          sprite.userData.number = number;
          sprite.scale.set(0.8, 0.8, 1);

          if (globeGroupRef.current) {
            globeGroupRef.current.add(sprite);
          }

          activeSpotsRef.current.push({
            number: number,
            sprite: sprite,
            originalPosition: position.clone(),
          });
          spotCounter++;
        }
        if (spotCounter >= globeNumbers.length) break;
      }

      while (spotCounter < globeNumbers.length) {
        const phi = Math.acos(-1 + 2 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        const position = new THREE.Vector3();
        position.setFromSphericalCoords(globeRadius + 0.1, phi, theta);

        const number = globeNumbers[spotCounter];
        const sprite = createNumberSprite(number);
        sprite.position.copy(position);
        sprite.userData.number = number;
        sprite.scale.set(0.8, 0.8, 1);

        if (globeGroupRef.current) {
          globeGroupRef.current.add(sprite);
        }

        activeSpotsRef.current.push({
          number: number,
          sprite: sprite,
          originalPosition: position.clone(),
        });
        spotCounter++;
      }
    };

    updateNumbers();
  }, [globeNumbers]);

  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      startSpin();
    } else if (!isSpinning && isSpinningRef.current) {
      stopSpin();
    }
  }, [isSpinning]);

  const stopSpin = () => {
    isSpinningRef.current = false;
    tweenGroupRef.current.removeAll();
    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  const startSpin = () => {
    isSpinningRef.current = true;
    if (controlsRef.current) controlsRef.current.enabled = false;
    tweenGroupRef.current.removeAll();

    const spinSegment = () => {
      if (!isSpinningRef.current) {
        return;
      }

      const segmentDuration = 1000; // 1-second segments
      const spinSpeed = 2 + Math.random() * 2; // Radians per second
      if (!globeGroupRef.current) return;
      const targetRotationY = globeGroupRef.current.rotation.y + spinSpeed;

      new Tween(globeGroupRef.current.rotation, tweenGroupRef.current)
        .to({ y: targetRotationY }, segmentDuration)
        .easing(Easing.Linear.None)
        .onComplete(spinSegment)
        .start();
    };

    spinSegment();
  };

  const animateShootOut = (
    sprite: THREE.Sprite,
    originalPos: THREE.Vector3,
    onCompleteCallback: () => void,
  ) => {
    const scene = sceneRef.current;
    const globeGroup = globeGroupRef.current;
    if (!scene || !globeGroup) return;

    const globeRadius = 10;
    const shootDistance = globeRadius * 0.8;
    const duration = 2000;

    const direction = originalPos.clone().normalize();
    const targetPosition = originalPos
      .clone()
      .add(direction.multiplyScalar(shootDistance));

    const shootLight = new THREE.PointLight(0xec4899, 2.5, shootDistance * 2);
    shootLight.position.copy(sprite.position);
    scene.add(shootLight);

    new Tween(sprite.position, tweenGroupRef.current)
      .to(
        {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
        },
        duration,
      )
      .easing(Easing.Exponential.Out)
      .onUpdate(() => {
        shootLight.position.copy(sprite.position);
      })
      .onComplete(() => {
        globeGroup.remove(sprite);
        scene.remove(shootLight);

        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();

        if (onCompleteCallback) onCompleteCallback();
      })
      .start();

    new Tween(sprite.scale, tweenGroupRef.current)
      .to({ x: 0.1, y: 0.1 }, duration)
      .easing(Easing.Exponential.Out)
      .start();

    new Tween({ intensity: shootLight.intensity }, tweenGroupRef.current)
      .to({ intensity: 0 }, duration / 2)
      .delay(duration / 2)
      .easing(Easing.Quadratic.Out)
      .onUpdate((obj) => {
        shootLight.intensity = obj.intensity;
      })
      .start();
  };

  useEffect(() => {
    if (
      !globeGroupRef.current ||
      !sceneRef.current ||
      !eliminations ||
      eliminations.length === 0
    )
      return;

    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    const activeSpots = activeSpotsRef.current;

    eliminations.forEach((numberToEliminate, index) => {
      const spotIndex = activeSpots.findIndex(
        (spot) => spot.number === numberToEliminate,
      );

      if (spotIndex !== -1) {
        const spot = activeSpots[spotIndex];

        animateShootOut(spot.sprite, spot.originalPosition, () => {
          activeSpotsRef.current = activeSpotsRef.current.filter(
            (s) => s.number !== numberToEliminate,
          );

          if (index === eliminations.length - 1 && controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        });
      }
    });
  }, [eliminations]);

  return (
    <div className="relative w-full h-screen bg-transparent text-gray-100 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
