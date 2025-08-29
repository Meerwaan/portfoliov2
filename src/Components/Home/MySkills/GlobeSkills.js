import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./GlobeSkills.css"; // on réutilise le CSS du globe (wrapper + panel)

function fibonacciSphere(count, radius = 2.2) {
    // distribution régulière de points sur une sphère
    const pts = [];
    const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2; // [-1, 1]
        const r = Math.sqrt(1 - y * y);
        const theta = (2 * Math.PI * i) / phi;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        pts.push(new THREE.Vector3(x * radius, y * radius, z * radius));
    }
    return pts;
}

export default function DotGlobeSkills({ skills }) {
    const wrapRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const globeGroupRef = useRef(null);
    const clickableRef = useRef([]); // meshes cliquables
    const hoverRef = useRef(null);
    const [active, setActive] = useState(null);

    // positions pour les gros points (une place par skill)
    const skillPositions = useMemo(
        () => fibonacciSphere(skills.length, 2.2),
        [skills.length]
    );

    useEffect(() => {
        const container = wrapRef.current;
        if (!container) return;

        // --- renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.setSize(container.clientWidth, 420);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // --- scene / camera ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / 420,
            0.1,
            1000
        );
        camera.position.set(0, 0, 6);
        cameraRef.current = camera;

        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        // --- controls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.45;
        controls.minDistance = 3.8;
        controls.maxDistance = 10;
        controlsRef.current = controls;

        // --- groupe de la "sphère" ---
        const globe = new THREE.Group();
        scene.add(globe);
        globeGroupRef.current = globe;

        // --- petits points décoratifs (constellation) ---
        const bgPts = fibonacciSphere(950, 2.2);
        const pos = new Float32Array(bgPts.length * 3);
        for (let i = 0; i < bgPts.length; i++) {
            pos[i * 3] = bgPts[i].x;
            pos[i * 3 + 1] = bgPts[i].y;
            pos[i * 3 + 2] = bgPts[i].z;
        }
        const bgGeo = new THREE.BufferGeometry();
        bgGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const bgMat = new THREE.PointsMaterial({
            color: 0xcfd8dc,         // gris léger
            size: 2,                 // pixels
            sizeAttenuation: false,  // taille en pixels (pas en unités monde)
            transparent: true,
            opacity: 0.65
        });
        const bgPoints = new THREE.Points(bgGeo, bgMat);
        globe.add(bgPoints);

        // --- gros points cliquables (compétences) ---
        const clickable = [];
        const nodeBase = 0x00aaff;

        skills.forEach((s, idx) => {
            const p = skillPositions[idx];

            const r = 0.085; // rayon du point (monde)
            const geo = new THREE.SphereGeometry(r, 16, 16);
            const mat = new THREE.MeshBasicMaterial({ color: nodeBase });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(p);
            mesh.userData = { skill: s, baseScale: 1 };
            globe.add(mesh);
            clickable.push(mesh);
        });
        clickableRef.current = clickable;

        // --- raycaster pour hover/click ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onMove(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const hits = raycaster.intersectObjects(clickableRef.current, false);
            const hit = hits[0]?.object || null;

            if (hoverRef.current !== hit) {
                // reset ancien hover
                if (hoverRef.current) {
                    hoverRef.current.scale.setScalar(hoverRef.current.userData.baseScale);
                }
                hoverRef.current = hit;
                container.style.cursor = hit ? "pointer" : "grab";
                if (hit) hit.scale.setScalar(1.35); // effet hover
            }
        }

        function onClick() {
            if (!hoverRef.current) return;
            setActive(hoverRef.current.userData.skill);
        }

        renderer.domElement.addEventListener("mousemove", onMove);
        renderer.domElement.addEventListener("click", onClick);

        // --- resize ---
        function onResize() {
            const w = container.clientWidth;
            const h = Math.max(340, Math.min(520, Math.floor(w * 0.5)));
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        onResize();
        window.addEventListener("resize", onResize);

        // --- boucle anim ---
        let raf;
        const tick = () => {
            controls.update();
            // pulsation douce des points cliquables
            const t = performance.now() * 0.0015;
            clickableRef.current.forEach((m, i) => {
                const pulse = 1 + Math.sin(t + i) * 0.05;
                m.scale.setScalar(m.userData.baseScale * pulse);
            });
            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        tick();

        // cleanup
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            renderer.domElement.removeEventListener("mousemove", onMove);
            renderer.domElement.removeEventListener("click", onClick);
            controls.dispose();
            renderer.dispose();
            container.innerHTML = "";
        };
    }, [skills, skillPositions]);

    return (
        <>
            <div ref={wrapRef} className="skills-globe" aria-label="Globe de points des compétences" />
            <div className="skills-globe-panel">
                {active ? (
                    <>
                        <h4 className="skills-globe-title">{active.label}</h4>
                        <p className="skills-globe-note">
                            {active.note || "Compétence clé de mon stack."}
                        </p>
                        <div className="skills-globe-meter">
                            <span>Niveau estimé : {active.pct}%</span>
                            <div className="skills-globe-bar">
                                <div style={{ width: `${active.pct}%` }} />
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="skills-globe-hint">
                        💡 Fais tourner (drag) et clique un gros point bleu pour voir le détail.
                    </p>
                )}
            </div>
        </>
    );
}
