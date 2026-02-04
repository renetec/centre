import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, RoundedBox, Cone } from '@react-three/drei';
import * as THREE from 'three';

const Avatar = ({ isSpeaking }) => {
    const headRef = useRef();
    const mouthRef = useRef();
    const [blink, setBlink] = useState(false);

    // Random blinking logic
    useEffect(() => {
        const blinkLoop = () => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
            setTimeout(blinkLoop, Math.random() * 3000 + 2000); // Blink every 2-5 seconds
        };
        const timeout = setTimeout(blinkLoop, 3000);
        return () => clearTimeout(timeout);
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // Subtle head float/bob
        if (headRef.current) {
            headRef.current.position.y = Math.sin(t * 1) * 0.05;
            headRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
            headRef.current.rotation.z = Math.sin(t * 0.3) * 0.02;
        }

        // Improved Lip Sync Animation
        if (mouthRef.current) {
            if (isSpeaking) {
                // Create a more organic "speaking" pattern using interference of multiple sine waves
                // This mimics the variable cadence of speech (syllables/pauses) better than a single wave
                const flutter = Math.sin(t * 20) * 0.5 + 0.5; // Fast movement
                const cadence = Math.sin(t * 8) * 0.5 + 0.5;  // Syllabic pacing
                const openness = (flutter * cadence * 1.0) + 0.2;

                mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, openness, 0.4);
            } else {
                // Close mouth smoothly
                mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.1, 0.2);
            }
        }
    });

    const skinColor = "#FFDFC4"; // Fair skin tone
    const hairColor = "#5D4037"; // Dark brown
    const shirtColor = "#3F51B5"; // Indigo

    return (
        <group ref={headRef}>
            {/* --- HEAD --- */}
            <Sphere args={[0.9, 64, 64]} scale={[1, 1.15, 1]}>
                <meshStandardMaterial color={skinColor} roughness={0.4} metalness={0.1} />
            </Sphere>

            {/* --- HAIR --- */}
            {/* Top Hair */}
            <Sphere args={[0.92, 32, 32]} position={[0, 0.1, -0.1]} scale={[1, 1, 1]}>
                <meshStandardMaterial color={hairColor} roughness={0.9} />
            </Sphere>
            {/* Front/Bangs detail (3 spheres) */}
            <Sphere args={[0.3, 16, 16]} position={[-0.5, 0.7, 0.75]}>
                <meshStandardMaterial color={hairColor} roughness={0.9} />
            </Sphere>
            <Sphere args={[0.35, 16, 16]} position={[0, 0.75, 0.8]}>
                <meshStandardMaterial color={hairColor} roughness={0.9} />
            </Sphere>
            <Sphere args={[0.3, 16, 16]} position={[0.5, 0.7, 0.75]}>
                <meshStandardMaterial color={hairColor} roughness={0.9} />
            </Sphere>
            {/* Back Hair volume */}
            <RoundedBox args={[1.9, 1.2, 1.2]} position={[0, -0.2, -0.4]} radius={0.5}>
                <meshStandardMaterial color={hairColor} roughness={0.9} />
            </RoundedBox>


            {/* --- FACE --- */}
            <group position={[0, 0, 0.85]}>

                {/* EYES */}
                <group position={[0, 0.15, 0]}>
                    {/* Left Eye */}
                    <group position={[-0.35, 0, 0]} scale={[1, blink ? 0.1 : 1, 1]}>
                        <Sphere args={[0.18, 32, 16]}>
                            <meshStandardMaterial color="white" roughness={0.2} />
                        </Sphere>
                        <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.15]}>
                            <meshStandardMaterial color="#3355FF" roughness={0.1} />
                        </Sphere>
                        <Sphere args={[0.03, 16, 16]} position={[0, 0, 0.22]}>
                            <meshStandardMaterial color="black" />
                        </Sphere>
                    </group>

                    {/* Right Eye */}
                    <group position={[0.35, 0, 0]} scale={[1, blink ? 0.1 : 1, 1]}>
                        <Sphere args={[0.18, 32, 16]}>
                            <meshStandardMaterial color="white" roughness={0.2} />
                        </Sphere>
                        <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.15]}>
                            <meshStandardMaterial color="#3355FF" roughness={0.1} />
                        </Sphere>
                        <Sphere args={[0.03, 16, 16]} position={[0, 0, 0.22]}>
                            <meshStandardMaterial color="black" />
                        </Sphere>
                    </group>
                </group>

                {/* NOSE */}
                <Cone args={[0.08, 0.3, 16]} position={[0, -0.05, 0.1]} rotation={[0, 0, 0]}>
                    <meshStandardMaterial color="#F0C0A0" roughness={0.4} />
                </Cone>


                {/* MOUTH */}
                <group position={[0, -0.4, 0.05]}>
                    {/* Mouth Interior (Black) */}
                    <RoundedBox ref={mouthRef} args={[0.3, 0.15, 0.05]} radius={0.05} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#3E2723" />
                    </RoundedBox>
                </group>

            </group>

            {/* --- NECK & BODY --- */}
            <group position={[0, -1.1, 0]}>
                <Cone args={[0.3, 0.6, 32]} position={[0, 0.3, 0]}>
                    <meshStandardMaterial color={skinColor} />
                </Cone>
                {/* Shoulders */}
                <RoundedBox args={[2.2, 0.8, 1]} position={[0, -0.4, 0]} radius={0.4}>
                    <meshStandardMaterial color={shirtColor} roughness={0.6} />
                </RoundedBox>
            </group>

        </group>
    );
};

export default Avatar;
