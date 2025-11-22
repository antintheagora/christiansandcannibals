// CONFIGURATION - ADJUST THESE VALUES
const CONFIG = {
    speed: 0.3,      // Controls the speed of the flow (Higher = Faster)
    density: 0.3,    // Controls the amount of noise (Lower = More Noise/Red, Higher = More Black Void)
    intensity: 1.0   // Controls the brightness of the red peaks
};

const canvas = document.getElementById('bg-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

// Resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

// Vertex Shader
const vsSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// Fragment Shader - Void Noise Edition (Configurable)
const fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    
    // Config Uniforms
    uniform float u_speed;
    uniform float u_density;
    uniform float u_intensity;

    // Random function (3D)
    float random(vec3 st) {
        return fract(sin(dot(st, vec3(12.9898, 78.233, 45.543))) * 43758.5453123);
    }

    // Random function (2D) - for grain
    float random2d(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 3D Value Noise
    float noise(vec3 st) {
        vec3 i = floor(st);
        vec3 f = fract(st);
        
        // 8 corners
        float a = random(i);
        float b = random(i + vec3(1.0, 0.0, 0.0));
        float c = random(i + vec3(0.0, 1.0, 0.0));
        float d = random(i + vec3(1.0, 1.0, 0.0));
        float e = random(i + vec3(0.0, 0.0, 1.0));
        float f_val = random(i + vec3(1.0, 0.0, 1.0));
        float g = random(i + vec3(0.0, 1.0, 1.0));
        float h = random(i + vec3(1.0, 1.0, 1.0));

        vec3 u = f * f * (3.0 - 2.0 * f);

        return mix(
            mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
            mix(mix(e, f_val, u.x), mix(g, h, u.x), u.y),
            u.z
        );
    }

    void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        // Mouse Interaction: Perturbation (Distortion)
        vec2 mouse = u_mouse / u_resolution.xy;
        mouse.x *= u_resolution.x / u_resolution.y;
        
        // Organic Distance Field
        float dist = distance(st, mouse);
        // Use 3D noise for interaction too
        float distNoise = noise(vec3(st * 4.0, u_time * 0.5));
        
        // Modulate the radius with noise
        float radius = 0.3 + distNoise * 0.1;
        float interact = smoothstep(radius, 0.0, dist);
        
        // Directional Warp (now evolving in place)
        vec2 warp = vec2(
            noise(vec3(st * 2.0, u_time)),
            noise(vec3(st * 2.0 + 10.0, u_time))
        );
        
        // Apply distortion
        vec2 dir = normalize(st - mouse);
        
        // Soften center
        float centerSoftness = smoothstep(0.0, 0.15, dist);
        
        st -= dir * interact * 0.03 * centerSoftness; 
        st += warp * interact * 0.06; 

        // 1. Base Noise (Grain)
        float grain = random2d(st + u_time * u_speed);
        
        // 2. Evolving Density (The "Clouds")
        // Use Z component for time to make it evolve in place without flowing
        float n = noise(vec3(st * 3.0, u_time * u_speed));
        n += 0.5 * noise(vec3(st * 6.0, u_time * u_speed * 1.5));
        n += 0.25 * noise(vec3(st * 12.0, u_time * u_speed * 2.0));
        n /= 1.75; // Normalize

        // 3. Color Mapping
        vec3 color = vec3(0.0);
        
        vec3 bloodRed = vec3(0.6, 0.0, 0.05) * u_intensity;
        vec3 brightRed = vec3(1.0, 0.1, 0.1) * u_intensity;
        
        float mask = smoothstep(u_density, u_density + 0.4, n); 
        
        color = mix(vec3(0.05), bloodRed, mask);
        
        // Add bright highlights
        color = mix(color, brightRed, smoothstep(0.7, 1.0, n) * 0.5);

        // 4. Apply Grain
        color += (grain - 0.5) * 0.15;

        // 5. Vignette
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float vig = 1.0 - pow(length(uv - 0.5) * 1.5, 2.0);
        color *= clamp(vig, 0.0, 1.0);

        gl_FragColor = vec4(color, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const mouseLocation = gl.getUniformLocation(program, "u_mouse");

// Config Uniform Locations
const speedLocation = gl.getUniformLocation(program, "u_speed");
const densityLocation = gl.getUniformLocation(program, "u_density");
const intensityLocation = gl.getUniformLocation(program, "u_intensity");

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = window.innerHeight - e.clientY;
});

function render(time) {
    time *= 0.001;

    // Smooth mouse movement
    mouseX += (targetMouseX - mouseX) * 0.1;
    mouseY += (targetMouseY - mouseY) * 0.1;

    resize();
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(mouseLocation, mouseX, mouseY);

    // Pass Config Values
    gl.uniform1f(speedLocation, CONFIG.speed);
    gl.uniform1f(densityLocation, CONFIG.density);
    gl.uniform1f(intensityLocation, CONFIG.intensity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
