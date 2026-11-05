// Sem MeshTransmissionMaterial: a refração é simulada e tudo soma luz sobre preto.
// Unidades de mundo: a altura visível é sempre 10; a fenda fica em uFendaX.

export const vertLente = /* glsl */ `
varying vec3 vNormal;
varying vec3 vVista;
varying vec2 vLocal;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vVista = normalize(-mv.xyz);
  vLocal = position.xy;
  gl_Position = projectionMatrix * mv;
}
`

export const fragLente = /* glsl */ `
uniform float uTempo;
varying vec3 vNormal;
varying vec3 vVista;
varying vec2 vLocal;

// Seção óptica: a linha de luz se curva dentro do vidro, e cada cor curva um pouco diferente.
float secao(vec2 p, float curva, float nitidez) {
  float x = p.x - curva * (1.0 - p.y * p.y);
  return exp(-x * x * nitidez);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vVista);
  float frente = max(dot(n, v), 0.0);
  float fresnel = pow(1.0 - frente, 3.2);
  vec2 p = vLocal + vec2(sin(uTempo * 0.21) * 0.012, 0.0);

  vec3 cor = vec3(secao(p, 0.10, 520.0), secao(p, 0.16, 640.0), secao(p, 0.23, 420.0));
  cor += vec3(0.30, 0.34, 0.95) * secao(p, 0.16, 26.0) * 0.20;

  vec3 aro = mix(vec3(0.08, 0.13, 0.58), vec3(0.72, 0.80, 1.0), smoothstep(0.35, 1.0, fresnel));
  cor += aro * fresnel * 1.2;
  cor += vec3(0.022, 0.034, 0.13) * (1.0 - frente * 0.7);

  // Reflexo da lâmpada: pequeno e quente, no alto do vidro.
  vec3 meio = normalize(v + normalize(vec3(-0.45, 0.6, 0.65)));
  cor += vec3(1.0, 0.86, 0.62) * pow(max(dot(n, meio), 0.0), 180.0) * 0.9;

  gl_FragColor = vec4(cor, 1.0);
}
`

export const vertFeixe = /* glsl */ `
varying vec2 vMundo;
void main() {
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vMundo = mundo.xy;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

export const fragFeixe = /* glsl */ `
uniform float uTempo;
uniform float uRaio;
uniform vec2 uLente;
varying vec2 vMundo;

float ruido(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(fract(sin(i * 91.17) * 43758.5453), fract(sin((i + 1.0) * 91.17) * 43758.5453), f);
}

// Leque de uma cor: abre na saída da lente e some com a distância.
float leque(float angulo, float abertura, float d) {
  float borda = smoothstep(abertura, abertura * 0.3, abs(angulo));
  return borda * exp(-d * 0.26);
}

void main() {
  float x = vMundo.x - uLente.x;
  float acima = vMundo.y - uLente.y;
  float saida = -acima - uRaio * 0.93; // Distância abaixo da borda inferior da lente.
  vec3 cor = vec3(0.0);

  // A fenda chega à lente e para na borda de cima: dentro do vidro quem desenha é a lente.
  float nucleo = exp(-x * x * 900.0) * smoothstep(uRaio * 0.94, uRaio * 0.99, acima);
  cor += vec3(1.0, 0.97, 0.92) * nucleo * smoothstep(5.6, 3.6, acima);

  if (saida > 0.0) {
    float angulo = atan(x, saida + 0.12);
    float estrias = 0.58 + 0.42 * ruido(angulo * 24.0 + uTempo * 0.06) * ruido(angulo * 57.0 - uTempo * 0.04 + 9.0) * 1.6;
    vec3 leques = vec3(
      leque(angulo - 0.016, 0.27, saida),
      leque(angulo, 0.23, saida),
      leque(angulo + 0.016, 0.31, saida) * 1.25
    );
    cor += leques * estrias * vec3(1.0, 0.88, 0.74) * 0.62 * smoothstep(0.0, 0.25, saida);
  }

  // Halo azul contínuo em volta do eixo, sem emenda na altura da lente.
  float eixo = exp(-x * x * 10.0) * smoothstep(5.8, 2.0, abs(acima));
  float r = length(vec2(x, acima));
  cor += vec3(0.24, 0.31, 0.95) * (eixo * 0.10 + exp(-r * r * 0.30) * 0.15);

  gl_FragColor = vec4(cor, 1.0);
}
`

export const vertPoeira = /* glsl */ `
uniform float uTempo;
uniform vec2 uLente;
attribute float aFase;
varying float vBrilho;
void main() {
  vec3 p = position;
  float t = uTempo * 0.05 + aFase;
  p.y -= mod(t, 1.0) * 7.5;
  p.x += sin(t * 9.0) * 0.1;
  float d = max(uLente.y - p.y, 0.0);
  float dentro = 1.0 - smoothstep(0.08, 0.26, abs(p.x - uLente.x) / (d + 0.6));
  vBrilho = dentro * smoothstep(0.0, 0.14, fract(t)) * smoothstep(1.0, 0.7, fract(t));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = 5.0 * (0.5 + 0.5 * fract(aFase * 7.0));
  gl_Position = projectionMatrix * mv;
}
`

export const fragPoeira = /* glsl */ `
varying float vBrilho;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(vec3(1.0, 0.9, 0.74) * a * vBrilho * 0.6, 1.0);
}
`
