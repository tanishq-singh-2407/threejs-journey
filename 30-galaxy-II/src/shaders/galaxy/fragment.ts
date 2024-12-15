export default `
varying vec3 v_color;

void main() {
    float strength = pow(1.0 - distance(gl_PointCoord, vec2(0.5)), 10.0); // disc
    gl_FragColor = vec4(vec3(mix(vec3(0.0), v_color, strength)), 1.0);
}
`;