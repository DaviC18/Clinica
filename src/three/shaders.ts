// Sem MeshTransmissionMaterial: a refração é simulada e tudo soma luz sobre preto.
// Unidades de mundo: a altura visível é sempre 10; a fenda fica em uFendaX.

// Uma linha do tempo só para lente, feixe e poeira; Cena.tsx calcula uDesde a cada quadro.
const pulsoGlsl = /* glsl */ `
uniform float uDesde; // Segundos desde a chegada do pulso ao vidro; negativo antes dela.
const float TRAVESSIA = 0.32; // Tempo que a luz leva do topo à base da lente.

// Ataque seco e queda lenta, como filamento: um brilho simétrico lê como pisca-pisca.
float acende(float d, float queda) {
  return smoothstep(0.0, 0.07, d) * exp(-max(d, 0.0) / queda);
}

// A luz recua no último segundo antes da chegada, para o impacto ter de onde crescer.
float recuo() {
  return smoothstep(-1.2, -0.1, uDesde) * (1.0 - step(0.0, uDesde));
}
`

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
${pulsoGlsl}

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

  float apoio = 1.0 - recuo() * 0.22;
  float flash = acende(uDesde, 0.75);
  float pouso = acende(uDesde - TRAVESSIA, 0.85);

  // A dispersão deriva devagar; cada cor percorre um caminho um pouco diferente.
  float deriva = sin(uTempo * 0.09) * 0.018;
  vec3 cor = vec3(
    secao(p, 0.10 + deriva, 520.0),
    secao(p, 0.16 + deriva * 1.35, 640.0),
    secao(p, 0.23 + deriva * 1.8, 420.0)
  ) * apoio;
  cor += vec3(0.30, 0.34, 0.95) * secao(p, 0.16 + deriva, 26.0) * (0.20 + flash * 0.16);

  // A frente de luz percorre a seção do topo à base: o vidro acende em sequência, não de uma vez.
  float alturaFrente = 1.0 - clamp(uDesde / TRAVESSIA, 0.0, 1.0) * 2.0;
  float trilha = exp(-pow((p.y - alturaFrente) * 4.5, 2.0));
  trilha *= smoothstep(0.0, 0.04, uDesde) * (1.0 - smoothstep(TRAVESSIA, TRAVESSIA + 0.18, uDesde));
  cor += vec3(0.92, 0.96, 1.0) * secao(p, 0.16 + deriva, 90.0) * trilha * 1.5;

  // Onde o facho toca o vidro: o topo acende na chegada, a base só quando a frente pousa nela.
  vec2 base = (p - vec2(0.0, -0.93)) * vec2(1.5, 1.0);
  cor += vec3(1.0, 0.91, 0.78) * exp(-dot(base, base) * 34.0) * (0.30 * apoio + pouso);
  vec2 topo = (p - vec2(0.0, 0.985)) * vec2(1.7, 1.0);
  cor += vec3(1.0, 0.97, 0.92) * exp(-dot(topo, topo) * 60.0) * (0.22 * apoio + flash * 0.45);

  vec3 aro = mix(vec3(0.08, 0.13, 0.58), vec3(0.72, 0.80, 1.0), smoothstep(0.35, 1.0, fresnel));
  cor += aro * fresnel * (1.2 + flash * 0.5);
  cor += vec3(0.022, 0.034, 0.13) * (1.0 - frente * 0.7);

  // Reflexo da lâmpada: pequeno e quente, e caminha devagar pela superfície.
  vec3 meio = normalize(v + normalize(vec3(-0.45 + sin(uTempo * 0.07) * 0.22, 0.6, 0.65)));
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
uniform float uAbertura; // 0 no topo da página, 1 quando o hero sai da tela.
uniform float uEscala; // Feixe e lente crescem juntos em telas largas.
uniform vec2 uLente;
varying vec2 vMundo;
${pulsoGlsl}

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
  float x = (vMundo.x - uLente.x) / uEscala;
  float acima = (vMundo.y - uLente.y) / uEscala;
  float saida = -acima - uRaio * 0.93; // Distância abaixo da borda inferior da lente.
  vec3 cor = vec3(0.0);

  // O pulso nasce acima da tela e acelera até o vidro: cabeça curta, cauda longa para cima.
  float avanco = clamp((uDesde + 0.6) / 0.6, 0.0, 1.0);
  float posPulso = mix(1.9, uRaio, avanco * avanco);
  float atras = acima - posPulso;
  float forma = atras > 0.0 ? exp(-atras * 2.6) : exp(-atras * atras * 70.0);
  float pulso = forma * smoothstep(-0.6, -0.45, uDesde) * (1.0 - smoothstep(0.0, 0.06, uDesde));

  // Depois da travessia, o leque responde: uma frente desce pelo facho e deixa um rastro lento.
  float chegou = uDesde - TRAVESSIA;
  float frente = max(chegou, 0.0) * 8.5;
  float onda = exp(-pow((saida - frente) * 0.9, 2.0));
  onda *= smoothstep(0.0, 0.05, chegou) * (1.0 - smoothstep(0.7, 1.1, chegou));
  float eco = acende(chegou, 1.1);
  float apoio = 1.0 - recuo() * 0.2;
  float respiro = 0.5 + 0.5 * sin(uTempo * 0.42);

  // A fenda chega à lente e para na borda de cima: dentro do vidro quem desenha é a lente.
  // Afina no recuo e tem um grão lento, de laser: uma linha perfeita parece desenho, não luz.
  float cintila = 0.92 + 0.08 * ruido(acima * 7.0 - uTempo * 1.6);
  // Ao rolar, a fenda se alarga: é o mesmo gesto que abre #diferenciais logo abaixo.
  float largura = (900.0 + recuo() * 700.0) / (1.0 + uAbertura * 5.0);
  float nucleo = exp(-x * x * largura) * smoothstep(uRaio * 0.94, uRaio * 0.99, acima);
  cor += vec3(1.0, 0.97, 0.92) * nucleo * cintila * apoio * (1.0 + pulso * 2.2);
  cor += vec3(0.86, 0.93, 1.0) * exp(-x * x * 44.0) * pulso * 0.45 * step(uRaio, acima);

  if (saida > 0.0) {
    float angulo = atan(x, saida + 0.12) + sin(uTempo * 0.09) * 0.0035;
    float estrias = 0.58 + 0.42 * ruido(angulo * 24.0 + uTempo * 0.06) * ruido(angulo * 57.0 - uTempo * 0.04 + 9.0) * 1.6;
    // As cores se abrem no impacto e voltam a se fechar junto com o rastro.
    float separacao = 0.016 + eco * 0.02;
    float abre = 1.0 + uAbertura * 0.9;
    vec3 leques = vec3(
      leque(angulo - separacao, 0.27 * abre, saida),
      leque(angulo, 0.23 * abre, saida),
      leque(angulo + separacao, 0.31 * abre, saida) * 1.25
    );
    float brilho = (0.62 + eco * 0.4 + onda * 0.7 + respiro * 0.04) * apoio * (1.0 + uAbertura * 0.7);
    cor += leques * estrias * vec3(1.0, 0.88, 0.74) * brilho * smoothstep(0.0, 0.25, saida);
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
attribute float aFase;
varying float vBrilho;
${pulsoGlsl}
void main() {
  vec3 p = position;
  float t = uTempo * 0.05 + aFase;
  p.y -= mod(t, 1.0) * 7.5;
  p.x += sin(t * 9.0) * 0.1;
  float d = max(-p.y, 0.0); // Posições relativas à lente: o grupo em Cena.tsx já a posiciona.
  float dentro = 1.0 - smoothstep(0.08, 0.26, abs(p.x) / (d + 0.6));
  vBrilho = dentro * smoothstep(0.0, 0.14, fract(t)) * smoothstep(1.0, 0.7, fract(t));
  vBrilho *= 1.0 + acende(uDesde - TRAVESSIA, 0.9) * 1.3; // O pó aparece quando o pulso atravessa o leque.
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
