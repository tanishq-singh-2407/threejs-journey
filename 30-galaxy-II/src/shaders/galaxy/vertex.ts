export default `
attribute float a_scale;
attribute vec3 a_randomness;
uniform float u_time;
uniform float u_speed;
varying vec3 v_color;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float radius = length(modelPosition.xz);
    float original_angle = atan(modelPosition.x, modelPosition.z);
    float offset_angle = (1.0 / radius) * u_time * u_speed;

    modelPosition.x = sin(original_angle + offset_angle) * radius;
    modelPosition.z = cos(original_angle + offset_angle) * radius;

    modelPosition.xyz += a_randomness;

    vec4 viewProjection = viewMatrix * modelPosition;
    vec4 projectedProjection = projectionMatrix * viewProjection;

    gl_Position = projectedProjection;
    gl_PointSize = (a_scale / - viewProjection.z);

    v_color = color;
}
`;
