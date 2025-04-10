// Canvas setup
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let navbar_offset = document.querySelector(".navbar").offsetHeight + document.querySelector(".headline").offsetHeight;

// Set canvas dimensions to match window dimensions
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Ball properties (NORMALIZED UNITS)
const sun = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 30,
    color: '#ffcc00',
    vx: 0,
    vy: 0,
    mass: 1,  // Normalized mass (Sun = 1)
    displayMass: 1,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0
};

const earth = {
    x: canvasWidth / 2 + 200,
    y: canvasHeight / 2,
    radius: 15,
    color: '#0077cc',
    vx: 0,
    vy: 0,  // Will be set dynamically
    mass: 3.0027e-6, // Normalized mass (Earth / Sun)
    displayMass: 3.0027e-6,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0
};

const moon = {
    x: canvasWidth / 2 + 200 + 40,
    y: canvasHeight / 2,
    radius: 5,
    color: '#aaaaaa',
    vx: 0,  // Will be set dynamically
    vy: 0,  // Will be set dynamically
    mass: 3.6943e-8, // Normalized mass (Moon / Sun)
    displayMass: 3.6943e-8,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0
};

const balls = [sun, earth, moon];

const DAMPING_FACTOR = 0.9999;
const TRACE_LENGTH = 50;
const TRACE_FADE_SPEED = 0.2;

// NORMALIZED CONSTANTS (G = 1, AU = 1, Sun's Mass = 1)
const GRAVITATIONAL_CONSTANT = 30;
const DISTANCE_SCALE = 1; // Now 1, as units are normalized

// Time unit: years. Choose a small time step for stability.
const TIME_STEP = 0.0001; // Reduced time step
const SIMULATION_SPEED = 100000;

function isInsideBall(x, y, ball) {
    const dx = x - ball.x;
    const dy = y - ball.y;
    return (dx * dx + dy * dy) <= (ball.radius * ball.radius);
}

const traces = balls.map(() => []);

// Event listeners for dragging
canvas.addEventListener('mousedown', function (event) {
    const x = event.clientX;
    const y = event.clientY;

    for (const ball of balls) {
        if (isInsideBall(x, y, ball)) {
            ball.isDragging = true;
            ball.dragOffsetX = x - ball.x;
            ball.dragOffsetY = y - ball.y;
            ball.vx = 0;
            ball.vy = 0;
            canvas.style.cursor = 'grabbing';
            break;
        }
    }
    event.preventDefault();
});

canvas.addEventListener('mousemove', function (event) {
    for (const ball of balls) {
        if (ball.isDragging) {
            ball.x = event.clientX - ball.dragOffsetX;
            ball.y = event.clientY - ball.dragOffsetY;
            break;
        }
    }
    event.preventDefault();
});

canvas.addEventListener('mouseup', function (event) {
    canvas.style.cursor = 'default';

    for (const ball of balls) {
        if (ball.isDragging) {
            const deltaX = event.clientX - ball.x - ball.dragOffsetX;
            const deltaY = event.clientY - ball.y - ball.dragOffsetY;
            ball.vx = deltaX * 0.1;
            ball.vy = deltaY * 0.1;
            ball.isDragging = false;
            ball.dragOffsetX = 0;
            ball.dragOffsetY = 0;
            break;
        }
    }
    event.preventDefault();
});

canvas.addEventListener('mouseout', function (event) {
    canvas.style.cursor = 'default';
    for (const ball of balls) {
        ball.isDragging = false;
    }
});

// RK4 implementation
function rk4Step(ball, derivativeCalculator) {
    const k1v = derivativeCalculator(ball.x, ball.y, ball.vx, ball.vy, ball).v;
    const k1p = derivativeCalculator(ball.x, ball.y, ball.vx, ball.vy, ball).p;

    const k2v = derivativeCalculator(ball.x + k1p.dx * TIME_STEP * SIMULATION_SPEED / 2, ball.y + k1p.dy * TIME_STEP * SIMULATION_SPEED / 2, ball.vx + k1v.dvx * TIME_STEP * SIMULATION_SPEED / 2, ball.vy + k1v.dvy * TIME_STEP * SIMULATION_SPEED / 2, ball).v;
    const k2p = derivativeCalculator(ball.x + k1p.dx * TIME_STEP * SIMULATION_SPEED / 2, ball.y + k1p.dy * TIME_STEP * SIMULATION_SPEED / 2, ball.vx + k1v.dvx * TIME_STEP * SIMULATION_SPEED / 2, ball.vy + k1v.dvy * TIME_STEP * SIMULATION_SPEED / 2, ball).p;

    const k3v = derivativeCalculator(ball.x + k2p.dx * TIME_STEP * SIMULATION_SPEED / 2, ball.y + k2p.dy * TIME_STEP * SIMULATION_SPEED / 2, ball.vx + k2v.dvx * TIME_STEP * SIMULATION_SPEED / 2, ball.vy + k2v.dvy * TIME_STEP * SIMULATION_SPEED / 2, ball).v;
    const k3p = derivativeCalculator(ball.x + k2p.dx * TIME_STEP * SIMULATION_SPEED / 2, ball.y + k2p.dy * TIME_STEP * SIMULATION_SPEED / 2, ball.vx + k2v.dvx * TIME_STEP * SIMULATION_SPEED / 2, ball.vy + k2v.dvy * TIME_STEP * SIMULATION_SPEED / 2, ball).p;

    const k4v = derivativeCalculator(ball.x + k3p.dx * TIME_STEP * SIMULATION_SPEED, ball.y + k3p.dy * TIME_STEP * SIMULATION_SPEED, ball.vx + k3v.dvx * TIME_STEP * SIMULATION_SPEED, ball.vy + k3v.dvy * TIME_STEP * SIMULATION_SPEED, ball).v;
    const k4p = derivativeCalculator(ball.x + k3p.dx * TIME_STEP * SIMULATION_SPEED, ball.y + k3p.dy * TIME_STEP * SIMULATION_SPEED, ball.vx + k3v.dvx * TIME_STEP * SIMULATION_SPEED, ball.vy + k3v.dvy * TIME_STEP * SIMULATION_SPEED, ball).p;

    ball.vx += TIME_STEP * SIMULATION_SPEED / 6 * (k1v.dvx + 2 * k2v.dvx + 2 * k3v.dvx + k4v.dvx);
    ball.vy += TIME_STEP * SIMULATION_SPEED / 6 * (k1v.dvy + 2 * k2v.dvy + 2 * k3v.dvy + k4v.dvy);
    ball.x += TIME_STEP * SIMULATION_SPEED / 6 * (k1p.dx + 2 * k2p.dx + 2 * k3p.dx + k4p.dx);
    ball.y += TIME_STEP * SIMULATION_SPEED / 6 * (k1p.dy + 2 * k2p.dy + 2 * k3p.dy + k4p.dy);
}

// Calculate derivatives
function calculateDerivatives(x, y, vx, vy, ball) {
    let dvx = 0;
    let dvy = 0;

    for (const otherBall of balls) {
        if (otherBall !== ball) {
            const dx = (otherBall.x - x);
            const dy = (otherBall.y - y);
            const distanceSquared = dx * dx + dy * dy  * DISTANCE_SCALE;
            const distance = Math.sqrt(distanceSquared);

            const force = GRAVITATIONAL_CONSTANT * ball.mass * otherBall.mass / distanceSquared;

            dvx += force * dx / (distance * ball.mass);
            dvy += force * dy / (distance * ball.mass);
        }
    }

    return {
        v: { dvx: dvx, dvy: dvy },
        p: { dx: vx, dy: vy }
    };
}

// Handle wall collisions
function handleWallCollisions(ball) {
    if (ball.x + ball.radius > canvasWidth || ball.x - ball.radius < 0) {
        ball.vx = -ball.vx * DAMPING_FACTOR;
        ball.x = Math.max(ball.radius, Math.min(ball.x, canvasWidth - ball.radius));
    }
    if (ball.y + ball.radius > canvasHeight || ball.y - ball.radius < navbar_offset) {
        ball.vy = -ball.vy * DAMPING_FACTOR;
        ball.y = Math.max(ball.radius + navbar_offset, Math.min(ball.y, canvasHeight - ball.radius));
    }
}


// Function to calculate initial velocities based on circular orbit assumption and NORMALIZED UNITS
function calculateInitialVelocities() {
    // Earth's velocity around the Sun (AU/year)
    const earthDistance = Math.sqrt(Math.pow(earth.x - sun.x, 2) + Math.pow(earth.y - sun.y, 2));
    const earthSpeed = Math.sqrt(GRAVITATIONAL_CONSTANT * sun.mass / earthDistance);

    earth.vx = 0;
    earth.vy = earthSpeed;

    // Moon's velocity around the Earth (AU/year)
    const moonDistance = Math.sqrt(Math.pow(moon.x - earth.x, 2) + Math.pow(moon.y - earth.y, 2));
    const moonSpeed = Math.sqrt(GRAVITATIONAL_CONSTANT * earth.mass / moonDistance);

    // Relative velocity of the Moon with respect to Earth
    const moonRelVX = 0;
    const moonRelVY = moonSpeed;

    // Convert to inertial frame (Sun-centered)
    moon.vx = earth.vx - moonRelVY * (earth.y - sun.y) / earthDistance;  // Corrected calculation
    moon.vy = earth.vy + moonRelVX * (earth.x - sun.x) / earthDistance;  // Corrected calculation
    console.log("Earth initial vx:", earth.vx, "vy:", earth.vy);
    console.log("Moon initial vx:", moon.vx, "vy:", moon.vy);
}


// Main draw loop
function drawBall() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Update ball positions
    for (const ball of balls) {
        if (!ball.isDragging) {
            rk4Step(ball, calculateDerivatives);
            handleWallCollisions(ball);
        }

        const i = balls.indexOf(ball);
        traces[i].push({
            x: ball.x,
            y: ball.y,
            time: Date.now(),
            opacity: 1
        });
    }

    // Draw traces
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        const trace = traces[i];

        ctx.beginPath();
        ctx.strokeStyle = ball.color;
        let firstPoint = true;

        for (let j = 0; j < trace.length; j++) {
            const point = trace[j];

            if (Date.now() - point.time > TRACE_LENGTH * 1000) {
                point.opacity -= TRACE_FADE_SPEED;
                if (point.opacity < 0) {
                    point.opacity = 0;
                }
            }

            ctx.globalAlpha = point.opacity;

            if (firstPoint) {
                ctx.moveTo(point.x, point.y);
                firstPoint = false;
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // Remove old trace points
    for (let i = 0; i < balls.length; i++) {
        traces[i] = traces[i].filter(point => point.opacity > 0);
    }

    // Draw the balls
    for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }

    // Request the next frame
    requestAnimationFrame(drawBall);
}


// Handle window resizing
window.addEventListener('resize', function () {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    sun.x = canvasWidth / 2;
    sun.y = canvasHeight / 2;
    earth.x = canvasWidth / 2 + 200;
    earth.y = canvasHeight / 2;
    moon.x = canvasWidth / 2 + 200 + 40;
    moon.y = canvasHeight / 2;

    calculateInitialVelocities();
});

// Set initial velocities
calculateInitialVelocities();

// Start the animation
drawBall();