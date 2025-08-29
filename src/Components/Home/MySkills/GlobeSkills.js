import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./GlobeSkills.css";

/* ===== Helpers ===== */
function fibonacciSphere(count, radius = 2.2) {
    const pts = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = (2 * Math.PI * i) / phi;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        pts.push(new THREE.Vector3(x * radius, y * radius, z * radius));
    }
    return pts;
}

function makeDotSprite(size = 128) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.5);
    g.addColorStop(0, "#33c3ff");
    g.addColorStop(1, "#00aaff");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(size/2, size/2, size*0.22, 0, Math.PI*2); ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(0.28, 0.28, 1); // discret
    return spr;
}
function makeRingSprite(size = 256) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.strokeStyle = "rgba(0,170,255,0.55)";
    ctx.lineWidth = size * 0.05;
    ctx.beginPath(); ctx.arc(size/2, size/2, size*0.34, 0, Math.PI*2); ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: true });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(0.55, 0.55, 1);
    return spr;
}

export default function GlobeSkills({ skills }) {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const sceneRef = useRef(null);
    const clickableRef = useRef([]); // hitboxes
    const hoverRef = useRef(null);
    const tooltipRef = useRef(null);

    const [active, setActive] = useState(null);

    const skillPositions = useMemo(
        () => fibonacciSphere(skills.length, 2.2),
        [skills.length]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ===== Tooltip HTML (collé au point, suit la rotation) =====
        const tip = document.createElement("div");
        tip.className = "skills-globe-tooltip";
        tip.style.display = "none";
        container.appendChild(tip);
        tooltipRef.current = tip;

        // ===== Renderer =====
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ===== Scene / Camera =====
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(0, 0, 6);
        cameraRef.current = camera;

        scene.add(new THREE.AmbientLight(0xffffff, 1));

        // ===== Controls =====
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.minDistance = 4.0;
        controls.maxDistance = 10.0;
        controlsRef.current = controls;

        // ===== Wireframe + nuage de points =====
        const wireGeo = new THREE.IcosahedronGeometry(2.2, 2);
        const wire = new THREE.LineSegments(
            new THREE.EdgesGeometry(wireGeo),
            new THREE.LineBasicMaterial({ color: 0xb0bec5, opacity: 0.5, transparent: true })
        );
        scene.add(wire);

        const cloudPts = fibonacciSphere(1000, 2.2);
        const buf = new Float32Array(cloudPts.length * 3);
        for (let i = 0; i < cloudPts.length; i++) {
            buf[i*3] = cloudPts[i].x; buf[i*3+1] = cloudPts[i].y; buf[i*3+2] = cloudPts[i].z;
        }
        const cloudGeo = new THREE.BufferGeometry();
        cloudGeo.setAttribute("position", new THREE.BufferAttribute(buf, 3));
        const cloudMat = new THREE.PointsMaterial({
            color: 0x94a3ab, size: 2.1, sizeAttenuation: false, opacity: 0.85, transparent: true
        });
        scene.add(new THREE.Points(cloudGeo, cloudMat));

        // ===== Marqueurs cliquables (point + anneau + hitbox) =====
        const clickables = [];
        const PICK_RADIUS = 0.34;

        skills.forEach((s, i) => {
            const pos = skillPositions[i];
            const group = new THREE.Group();
            group.position.copy(pos);

            const ring = makeRingSprite();
            const dot  = makeDotSprite();
            group.add(ring);
            group.add(dot);

            const hit = new THREE.Mesh(
                new THREE.SphereGeometry(PICK_RADIUS, 12, 12),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            hit.userData = { skill: s, group, ring, dot, base: { ring: 0.55, dot: 0.28 } };
            group.add(hit);

            scene.add(group);
            clickables.push(hit);
        });
        clickableRef.current = clickables;

        // ===== Raycaster (hover/click) =====
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const projectToScreen = (obj) => {
            const v = new THREE.Vector3();
            obj.getWorldPosition(v);
            v.project(camera);
            const rect = renderer.domElement.getBoundingClientRect();
            return {
                x: ((v.x + 1) / 2) * rect.width + rect.left,
                y: ((-v.y + 1) / 2) * rect.height + rect.top
            };
        };

        function placeTooltipOn(obj, text) {
            const p = projectToScreen(obj);
            tip.textContent = text;
            tip.style.display = "block";
            tip.style.left = `${p.x}px`;
            tip.style.top  = `${p.y - 16}px`; // juste au-dessus du point
        }

        function onMove(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const hit = raycaster.intersectObjects(clickableRef.current, false)[0]?.object || null;

            if (hoverRef.current !== hit) {
                // reset ancien
                if (hoverRef.current) {
                    const { ring, dot, base } = hoverRef.current.userData;
                    ring.scale.set(base.ring, base.ring, 1);
                    dot.scale.set(base.dot, base.dot, 1);
                }
                hoverRef.current = hit;
                container.style.cursor = hit ? "pointer" : "grab";
            }

            if (hit) {
                const { ring, dot, skill } = hit.userData;
                ring.scale.set(0.72, 0.72, 1);
                dot.scale.set(0.34, 0.34, 1);
                placeTooltipOn(hit, skill.label);
            } else {
                tip.style.display = "none";
            }
        }

        function onClick() {
            if (!hoverRef.current) return;
            setActive(hoverRef.current.userData.skill);
        }

        renderer.domElement.addEventListener("mousemove", onMove);
        renderer.domElement.addEventListener("click", onClick);

        // ===== Resize (plus haut pour ne plus couper) =====
        function fitCanvas() {
            const w = container.clientWidth;
            const h = Math.max(420, Math.min(560, Math.floor(w * 0.6))); // <<< plus de hauteur
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        fitCanvas();
        window.addEventListener("resize", fitCanvas);

        // ===== Animation (et suivi du tooltip même sans bouger la souris) =====
        let raf;
        const tick = () => {
            controls.update();

            // ring pulsation légère
            const t = performance.now() * 0.0015;
            clickableRef.current.forEach((obj, i) => {
                const { ring, base } = obj.userData;
                // stop pulsation sur l'élément survolé pour plus de stabilité visuelle
                const k = (hoverRef.current && hoverRef.current === obj)
                    ? 0.72
                    : base.ring + Math.sin(t + i) * 0.02;
                ring.scale.set(k, k, 1);
            });

            // si un point est survolé et que la scène bouge, on recale le tooltip
            if (hoverRef.current) {
                const { skill } = hoverRef.current.userData;
                placeTooltipOn(hoverRef.current, skill.label);
            }

            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        tick();

        // ===== Cleanup =====
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", fitCanvas);
            renderer.domElement.removeEventListener("mousemove", onMove);
            renderer.domElement.removeEventListener("click", onClick);
            controls.dispose();
            renderer.dispose();
            if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
            container.innerHTML = "";
        };
    }, [skills, skillPositions]);

    return (
        <>
            <div ref={containerRef} className="skills-globe" aria-label="Globe de points des compétences" />
            <div className="skills-globe-panel">
                {active ? (
                    <>
                        <h4 className="skills-globe-title">{active.label}</h4>
                        <p className="skills-globe-note">{active.note || "Compétence clé de mon stack."}</p>
                        <div className="skills-globe-meter">
                            <span>Niveau estimé : {active.pct}%</span>
                            <div className="skills-globe-bar">
                                <div style={{ width: `${active.pct}%` }} />
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="skills-globe-hint">💡 Survole une pastille — le nom s’affiche à côté. Clique pour voir le détail.</p>
                )}
            </div>
        </>
    );
}
