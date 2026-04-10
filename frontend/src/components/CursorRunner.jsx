import { useEffect, useRef, useState } from 'react';
import '../css/CursorRunner.css';

// Keep values inside a safe min and max range
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Pick a random decimal between two values
function randomBetween(min, max) {
    return min + (Math.random() * (max - min));
}

// Move a current value toward a target without overshooting
function approach(current, target, maxDelta) {
    if (current < target) {
        return Math.min(current + maxDelta, target);
    }

    return Math.max(current - maxDelta, target);
}

// Choose a new idle movement target
// This makes the littlr mascot guy wander in a natural direction while also not living at the edges of the screen
function pickWanderTarget(currentX, currentY, mascotSize, padding) {
    const angle = Math.random() * Math.PI * 2;
    const distance = randomBetween(300, 400);

    let targetX = currentX + (Math.cos(angle) * distance);
    let targetY = currentY + (Math.sin(angle) * distance);

    const currentCenterX = currentX + (mascotSize / 2);
    const currentCenterY = currentY + (mascotSize / 2);

    const centrePullX = ((window.innerWidth / 2) - currentCenterX) * 0.18;
    const centrePullY = ((window.innerHeight / 2) - currentCenterY) * 0.18;

    targetX += centrePullX;
    targetY += centrePullY;

    return {
        x: clamp(targetX, padding, window.innerWidth - mascotSize - padding),
        y: clamp(targetY, padding, window.innerHeight - mascotSize - padding)
    };
}

function CursorRunner() {
    // Main behaviour tuning values
    // These control size, fear distance, movement speed, spacing from edges, etc
    const mascotSize = 28;
    const enterFearRadius = 165;
    const exitFearRadius = 235;
    const panicRadius = 110;
    const idleSpeed = 86;
    const fleeSpeed = 760;
    const panicSpeed = 1200;
    const padding = 10;
    const predictionSeconds = 0.1;
    const minFearSeconds = 0.22;

    // Store live movement data without causing rerenders every frame
    const runnerRef = useRef(null);
    const faceRef = useRef('normal');
    const modeRef = useRef('wander');
    const fearUntilRef = useRef(0);
    const escapeTargetRef = useRef(null);
    const repathCooldownRef = useRef(0);
    const wanderTargetRef = useRef(null);
    const wanderRetargetAtRef = useRef(0);

    // State is only used for the face class so React updates happen rarely
    const [face, setFace] = useState('normal');

    // Current on-screen position of the mascot
    const positionRef = useRef({
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.74
    });

    // Current movement velocity
    const velocityRef = useRef({
        x: 0,
        y: 0
    });

    // Mouse tracking data
    // Stores position plus estimated mouse velocity so the mascot can react
    // to where the cursor is going. Not just where it is right now
    const mouseRef = useRef({
        x: -9999,
        y: -9999,
        vx: 0,
        vy: 0,
        lastX: null,
        lastY: null,
        lastTime: 0
    });

    useEffect(() => {
        const runner = runnerRef.current;

        if (!runner) {
            return undefined;
        }

        // Apply the visual screen position directly to the DOM node
        const setRunnerTransform = (x, y) => {
            runner.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };

        setRunnerTransform(positionRef.current.x, positionRef.current.y);

        // Track cursor movement and estimate cursor velocity,
        const handleMouseMove = (e) => {
            const now = performance.now();
            const mouse = mouseRef.current;

            if (mouse.lastX !== null && mouse.lastY !== null && mouse.lastTime) {
                const dt = Math.max((now - mouse.lastTime) / 1000, 0.001);
                mouse.vx = (e.clientX - mouse.lastX) / dt;
                mouse.vy = (e.clientY - mouse.lastY) / dt;
            }

            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.lastX = e.clientX;
            mouse.lastY = e.clientY;
            mouse.lastTime = now;
        };

        window.addEventListener('mousemove', handleMouseMove);

        let animationFrameId;
        let lastFrameTime = performance.now();

        // Main animation loop
        // Runs every frame, updates mode, velocity, position, and face state
        const tick = (now) => {
            const dt = Math.min((now - lastFrameTime) / 1000, 0.03);
            lastFrameTime = now;

            const position = positionRef.current;
            const velocity = velocityRef.current;
            const mouse = mouseRef.current;

            // Predict where the mouse will be very shortly so movement feels less choppy
            const predictedMouseX = mouse.x + (mouse.vx * predictionSeconds);
            const predictedMouseY = mouse.y + (mouse.vy * predictionSeconds);

            const runnerCenterX = position.x + (mascotSize / 2);
            const runnerCenterY = position.y + (mascotSize / 2);

            const dx = runnerCenterX - predictedMouseX;
            const dy = runnerCenterY - predictedMouseY;
            const distanceFromMouse = Math.sqrt((dx * dx) + (dy * dy)) || 1;

            const nowSeconds = now / 1000;
            let nextMode = modeRef.current;

            // Mode switching with hysteresis
            // The mascot gets scared when the mouse gets close enough
            // It only relaxes after the cursor is farther away and enough time has passed 
            if (modeRef.current === 'wander') {
                if (distanceFromMouse < enterFearRadius) {
                    nextMode = 'scared';
                    fearUntilRef.current = nowSeconds + minFearSeconds;
                    wanderTargetRef.current = null;
                }
            } else {
                const canRelax =
                    distanceFromMouse > exitFearRadius &&
                    nowSeconds > fearUntilRef.current;

                if (canRelax) {
                    nextMode = 'wander';
                    escapeTargetRef.current = null;
                    wanderTargetRef.current = null;
                    wanderRetargetAtRef.current = 0;
                }
            }

            modeRef.current = nextMode;

            // Desired movement values for this frame
            let desiredVelocityX = 0;
            let desiredVelocityY = 0;
            let maxTurnRate = 0;
            let nextFace = nextMode === 'scared' ? 'scared' : 'normal';

            // Scared behaviour
            // Pick a escape point away from the cursor and sometimes add side bias
            if (nextMode === 'scared') {
                const shouldPickNewEscapeTarget =
                    !escapeTargetRef.current ||
                    distanceFromMouse < panicRadius ||
                    nowSeconds > repathCooldownRef.current;

                if (shouldPickNewEscapeTarget) {
                    const unitX = dx / distanceFromMouse;
                    const unitY = dy / distanceFromMouse;

                    const sideBias = Math.random() > 0.5 ? 1 : -1;
                    const perpendicularX = -unitY * sideBias;
                    const perpendicularY = unitX * sideBias;

                    const distanceAway = distanceFromMouse < panicRadius ? 100 : 70;

                    let targetX = runnerCenterX + (unitX * distanceAway) + (perpendicularX * 120);
                    let targetY = runnerCenterY + (unitY * distanceAway) + (perpendicularY * 120);

                    const centrePullX = ((window.innerWidth / 2) - runnerCenterX) * 0.22;
                    const centrePullY = ((window.innerHeight / 2) - runnerCenterY) * 0.22;

                    targetX += centrePullX;
                    targetY += centrePullY;

                    escapeTargetRef.current = {
                        x: clamp(targetX - (mascotSize / 2), padding, window.innerWidth - mascotSize - padding),
                        y: clamp(targetY - (mascotSize / 2), padding, window.innerHeight - mascotSize - padding)
                    };

                    repathCooldownRef.current = nowSeconds + 0.18;
                }

                const target = escapeTargetRef.current;
                const toTargetX = target.x - position.x;
                const toTargetY = target.y - position.y;
                const targetDistance = Math.sqrt((toTargetX * toTargetX) + (toTargetY * toTargetY)) || 1;

                const targetUnitX = toTargetX / targetDistance;
                const targetUnitY = toTargetY / targetDistance;

                const targetSpeed = distanceFromMouse < panicRadius ? panicSpeed : fleeSpeed;

                desiredVelocityX = targetUnitX * targetSpeed;
                desiredVelocityY = targetUnitY * targetSpeed;
                maxTurnRate = 2600 * dt;

                // Once it reaches the current escape target, allow a new one to be picked
                if (targetDistance < 18) {
                    escapeTargetRef.current = null;
                }
            } else {
                // Wandering behaviour
                // The mascot slowly picks random nearby goals and glides toward them
                const currentWanderTarget = wanderTargetRef.current;

                let targetDistance = Infinity;

                if (currentWanderTarget) {
                    const toTargetX = currentWanderTarget.x - position.x;
                    const toTargetY = currentWanderTarget.y - position.y;
                    targetDistance = Math.sqrt((toTargetX * toTargetX) + (toTargetY * toTargetY));
                }

                const shouldPickNewWanderTarget =
                    !currentWanderTarget ||
                    nowSeconds > wanderRetargetAtRef.current ||
                    targetDistance < 12;

                if (shouldPickNewWanderTarget) {
                    wanderTargetRef.current = pickWanderTarget(
                        position.x,
                        position.y,
                        mascotSize,
                        padding
                    );

                    wanderRetargetAtRef.current = nowSeconds + randomBetween(1.2, 2.5);
                }

                const target = wanderTargetRef.current;

                if (target) {
                    const toTargetX = target.x - position.x;
                    const toTargetY = target.y - position.y;
                    const wanderDistance = Math.sqrt((toTargetX * toTargetX) + (toTargetY * toTargetY)) || 1;

                    const targetUnitX = toTargetX / wanderDistance;
                    const targetUnitY = toTargetY / wanderDistance;

                    desiredVelocityX = targetUnitX * idleSpeed;
                    desiredVelocityY = targetUnitY * idleSpeed;
                    maxTurnRate = 520 * dt;
                } else {
                    desiredVelocityX = 0;
                    desiredVelocityY = 0;
                    maxTurnRate = 420 * dt;
                }
            }

            // edge avoidance so the mascot starts steering away before hitting a wall
            if (position.x < 65) {
                desiredVelocityX += 180;
            } else if (position.x > window.innerWidth - mascotSize - 65) {
                desiredVelocityX -= 180;
            }

            if (position.y < 65) {
                desiredVelocityY += 180;
            } else if (position.y > window.innerHeight - mascotSize - 65) {
                desiredVelocityY -= 180;
            }

            // steer current velocity toward desired velocity
            velocity.x = approach(velocity.x, desiredVelocityX, maxTurnRate);
            velocity.y = approach(velocity.y, desiredVelocityY, maxTurnRate);

            // Move based on velocity and frame time
            position.x += velocity.x * dt;
            position.y += velocity.y * dt;

            // Hard screen boundaries so the mascot never leaves the screen
            const minX = padding;
            const maxX = window.innerWidth - mascotSize - padding;
            const minY = padding;
            const maxY = window.innerHeight - mascotSize - padding;

            let hitEdge = false;

            if (position.x < minX) {
                position.x = minX;
                velocity.x = Math.max(0, velocity.x) * 0.35;
                hitEdge = true;
            } else if (position.x > maxX) {
                position.x = maxX;
                velocity.x = Math.min(0, velocity.x) * 0.35;
                hitEdge = true;
            }

            if (position.y < minY) {
                position.y = minY;
                velocity.y = Math.max(0, velocity.y) * 0.35;
                hitEdge = true;
            } else if (position.y > maxY) {
                position.y = maxY;
                velocity.y = Math.min(0, velocity.y) * 0.35;
                hitEdge = true;
            }

            // If it collides with an edge, force a fresh target next frame
            if (hitEdge) {
                if (nextMode === 'scared') {
                    escapeTargetRef.current = null;
                } else {
                    wanderTargetRef.current = null;
                }
            }

            // Apply new position to the DOM
            setRunnerTransform(position.x, position.y);

            // Only update face state when it actually changes
            if (faceRef.current !== nextFace) {
                faceRef.current = nextFace;
                setFace(nextFace);
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        // Cleanup listeners and animation on unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Render the mascot structure
    return (
        <div
            ref={runnerRef}
            className={`cursor-runner cursor-runner--${face}`}
            aria-hidden="true"
        >
            <div className="runner-piece">
                <div className="runner-inner-hole" />

                <div className="runner-face">
                    <div className="runner-eye-group runner-eye-group--left">
                        <span className="runner-brow" />
                        <span className="runner-eye">
                            <span className="runner-pupil" />
                        </span>
                    </div>

                    <div className="runner-eye-group runner-eye-group--right">
                        <span className="runner-brow" />
                        <span className="runner-eye">
                            <span className="runner-pupil" />
                        </span>
                    </div>
                </div>

                <div className="runner-legs">
                    <span className="runner-leg" />
                    <span className="runner-leg" />
                </div>
            </div>
        </div>
    );
}

export default CursorRunner;