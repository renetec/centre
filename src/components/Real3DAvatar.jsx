import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, Sphere, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Real3DAvatar = ({ isSpeaking }) => {
    const group = useRef();
    const mouthRef = useRef();
    const [blink, setBlink] = useState(false);

    const { scene } = useGLTF('/model.glb');
    const clone = React.useMemo(() => scene.clone(), [scene]);

    // Blinking logic
    useEffect(() => {
        const blinkLoop = () => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
            setTimeout(blinkLoop, Math.random() * 3000 + 2000);
        };
        const timeout = setTimeout(blinkLoop, 3000);
        return () => clearTimeout(timeout);
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // A. Breathing / Idle Animation
        if (group.current) {
            group.current.position.y = -0.5 + Math.sin(t * 1) * 0.02;
            group.current.rotation.y = Math.sin(t * 0.5) * 0.05;
        }

        // B. Speaking Animation (Mouth and Body Bounce)
        if (isSpeaking) {
            // Bounce body slightly
            if (group.current) {
                group.current.scale.y = 1 + Math.sin(t * 20) * 0.005;
            }

            // Animate Mouth
            if (mouthRef.current) {
                const openAmount = Math.sin(t * 20) * 0.5 + 0.5;
                // Scale Y to open/close
                mouthRef.current.scale.y = 0.2 + (openAmount * 0.8);
            }
        } else {
            // Return to rest
            if (mouthRef.current) {
                mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.1, 0.2);
            }
        }
    });

    return (
        <group ref={group} dispose={null} position={[0, -0.5, 0]} scale={1.8}>
            <primitive object={clone} />

            {/* 
         Attach Face to the group so it moves with the rock.
         Positioning is approximate and may need tuning based on the specific rock model geometry.
         We place it roughly where a "head" would be on a standing rock.
       */}
            <group position={[-0.15, 0.75, 0.6]} scale={0.4}> {/* Adjust scale/pos to fit the rock */}

                {/* Left Eye */}
                <group position={[-0.3, 0.2, 0]} scale={[1, blink ? 0.1 : 1, 1]}>
                    <Sphere args={[0.25, 32, 32]}>
                        <meshStandardMaterial color="white" />
                    </Sphere>
                    <Sphere args={[0.1, 32, 32]} position={[0, 0, 0.2]}>
                        <meshStandardMaterial color="black" />
                    </Sphere>
                </group>

                {/* Right Eye */}
                <group position={[0.3, 0.2, 0]} scale={[1, blink ? 0.1 : 1, 1]}>
                    <Sphere args={[0.25, 32, 32]}>
                        <meshStandardMaterial color="white" />
                    </Sphere>
                    <Sphere args={[0.1, 32, 32]} position={[0, 0, 0.2]}>
                        <meshStandardMaterial color="black" />
                    </Sphere>
                </group>

                {/* Mouth */}
                <group position={[0, -0.2, 0]}>
                    {/* Mouth Background/Interior */}
                    <RoundedBox ref={mouthRef} args={[0.4, 0.3, 0.1]} radius={0.05} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#3E2723" />
                    </RoundedBox>
                </group>

            </group>
        </group>
    );
};

useGLTF.preload('/model.glb');

export default Real3DAvatar;
