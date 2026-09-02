/* Cumbuco Beach — logo motion piece. Layers are masked crops of logo.png. */
(function(){
const React = window.React;
const CB = {
  useComposition: window.useComposition,
  CompositionStage: window.CompositionStage,
  Easing: window.Easing,
  animate: window.animate,
  clamp: window.clamp,
};
const { useComposition, CompositionStage, Easing, animate, clamp } = CB;

const SRC = 'logo.png';
const LW = 1003, LH = 776;
const SUN = { cx: 492.5, cy: 266.6 };

const NAVY = '#0F4B60', RED = '#E74523', TEAL = '#008292', ORANGE = '#F18818';

const MOTION = {
  enter: (from, to, start, end) => animate({ from, to, start, end, ease: Easing.easeOutCubic }),
  pop:   (from, to, start, end) => animate({ from, to, start, end, ease: Easing.easeOutBack }),
  draw:  (from, to, start, end) => animate({ from, to, start, end, ease: Easing.easeInOutSine }),
};

const ROW1 = [[0, 116], [147, 252], [287, 427], [463, 566], [599, 704], [736, 852], [883, 1002]];
const ROW2 = [[198, 306], [335, 427], [452, 559], [576, 675], [702, 804]];
const LETTERS = [
  ...ROW1.map(([x0, x1], i) => ({ x0, x1, y0: 389, y1: 611, i })),
  ...ROW2.map(([x0, x1], i) => ({ x0, x1, y0: 617, y1: 776, i: i + ROW1.length })),
];

function Crop({ x0, y0, x1, y1, mask, style, imgStyle, wrapStyle }) {
  return (
    <div style={{ position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, overflow: 'hidden', ...style, ...wrapStyle }}>
      <img
        src={SRC}
        width={LW}
        height={LH}
        draggable="false"
        style={{
          position: 'absolute', left: -x0, top: -y0, width: LW, height: LH,
          WebkitMaskImage: mask, maskImage: mask, ...imgStyle,
        }}
      />
    </div>
  );
}

function LiquidDefs({ T, amp, freqY }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="liquid" x="-25%" y="-60%" width="150%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="turbulence" baseFrequency={`0.004 ${freqY}`} numOctaves="1" seed="7" result="n" />
          <feOffset in="n" dx={-T * 34} dy={Math.sin(T * 0.9) * 12} result="no" />
          <feDisplacementMap in="SourceGraphic" in2="no" scale={amp} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquidSoft" x="-25%" y="-60%" width="150%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="turbulence" baseFrequency="0.004 0.016" numOctaves="2" seed="19" result="n" />
          <feOffset in="n" dx={-T * 20} dy={Math.cos(T * 0.7) * 14} result="no" />
          <feDisplacementMap in="SourceGraphic" in2="no" scale={amp * 1.6} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

function Piece(props) {
  const { T, CUES, authoredTotal } = useComposition();
  const spin = props.spinSpeed == null ? 1 : Number(props.spinSpeed);
  const glowAmt = props.glow == null ? 1 : Number(props.glow);

  const cIgnite = CUES.Ignite, cWave = CUES.Wave, cWord = CUES.Wordmark, cShine = CUES.Shine;
  const total = authoredTotal;

  /* camera */
  const zoom = MOTION.draw(1.035, 1.085, cIgnite, total)(T);
  const drift = Math.sin(T * 0.42) * 9;
  const outro = 1 - clamp((T - (total - 0.45)) / 0.45, 0, 1);

  /* sun */
  const sunScale = MOTION.pop(0.02, 1, cIgnite + 0.12, cIgnite + 1.15)(T);
  const sunRise = MOTION.pop(70, 0, cIgnite + 0.12, cIgnite + 1.3)(T);
  const sunBreathe = 1 + Math.sin(T * 1.15) * 0.012;

  /* rays */
  const rayIn = MOTION.enter(0.5, 1, cIgnite + 0.55, cIgnite + 1.7)(T);
  const rayFade = MOTION.enter(0, 1, cIgnite + 0.5, cIgnite + 1.25)(T);
  const rayRot = MOTION.enter(-30, 0, cIgnite + 0.5, cWave + 0.6)(T) + T * 3.1 * spin;
  const rayPulse = 1 + Math.sin(T * 2.1) * 0.018;

  /* wave */
  const waveReveal = clamp((T - (cWave - 0.35)) / 1.5, 0, 1);
  const waveEase = Easing.easeInOutCubic(waveReveal);
  const waveRise = MOTION.enter(46, 0, cWave - 0.3, cWave + 1.1)(T);
  const waveBob = Math.sin(T * 1.3) * 5;
  const liquidAmp = 3.6 + Math.sin(T * 0.8) * 1.8 + (1 - waveEase) * 9;
  const freqY = 0.012 + Math.sin(T * 0.5) * 0.003;

  /* glow */
  const glowUp = MOTION.enter(0, 1, cIgnite, cIgnite + 1.6)(T);
  const glowPulse = (0.55 + Math.sin(T * 1.05) * 0.16 + (T > cShine ? 0.1 : 0)) * glowUp * glowAmt;

  const letters = LETTERS.map((L) => {
    const start = cWord - 0.25 + L.i * 0.072;
    const rise = MOTION.pop(120, 0, start, start + 0.85)(T);
    const op = clamp((T - start) / 0.28, 0, 1);
    const settle = clamp((T - (start + 0.85)) / 0.5, 0, 1);
    const ripple = Math.sin(T * 2.3 - L.i * 0.62) * 3.6 * settle;
    const tilt = MOTION.pop(-7, 0, start, start + 0.9)(T) + Math.sin(T * 2.3 - L.i * 0.62) * 0.7 * settle;
    const sq = 1 + (1 - settle) * 0.0;
    return { ...L, y: rise + ripple, op, tilt, sq };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#07161E' }}>
      <LiquidDefs T={T} amp={liquidAmp} freqY={freqY} />

      {/* ambient background */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 28%, #12384A 0%, #0A2130 45%, #07161E 100%)' }} />
      <div style={{
        position: 'absolute', left: '50%', top: '34%', width: 1500, height: 1500, marginLeft: -750, marginTop: -750,
        background: `radial-gradient(closest-side, rgba(231,69,35,${0.30 * glowPulse}) 0%, rgba(241,136,24,${0.16 * glowPulse}) 34%, rgba(0,130,146,0) 72%)`,
        filter: 'blur(6px)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 420,
        background: `linear-gradient(to top, rgba(0,130,146,${0.20 * glowUp}) 0%, rgba(0,130,146,0) 100%)`,
      }} />

      {/* logo stage */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', width: LW, height: LH,
        marginLeft: -LW / 2, marginTop: -LH / 2,
        transform: `translate(${drift}px, ${-drift * 0.35}px) scale(${zoom})`,
        opacity: outro,
      }}>
        {/* rays */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: `rotate(${rayRot}deg) scale(${rayIn * rayPulse})`,
          transformOrigin: `${SUN.cx}px ${SUN.cy}px`,
          opacity: rayFade,
          filter: `drop-shadow(0 0 ${16 * glowPulse}px rgba(241,136,24,0.6))`,
        }}>
          <Crop
            x0={0} y0={0} x1={LW} y1={288}
            mask={`radial-gradient(circle at ${SUN.cx}px ${SUN.cy}px, transparent 132px, #000 140px)`}
          />
        </div>

        {/* sun disc */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translateY(${sunRise}px) scale(${sunScale * sunBreathe})`,
          transformOrigin: `${SUN.cx}px ${SUN.cy}px`,
          filter: `drop-shadow(0 0 ${34 * glowPulse}px rgba(231,69,35,0.5))`,
        }}>
          <Crop
            x0={348} y0={92} x1={638} y1={291}
            imgStyle={{ clipPath: `circle(138px at ${SUN.cx}px ${SUN.cy}px)` }}
          />
        </div>

        {/* wave — echo then main, both liquid-displaced */}
        <div style={{
          position: 'absolute', inset: 0, transform: `translateY(${waveRise + waveBob + 10}px)`,
          opacity: 0.34 * waveEase, filter: 'url(#liquidSoft) blur(1px)',
          clipPath: `inset(0 ${(1 - waveEase) * 100}% 0 0)`,
        }}>
          <Crop x0={128} y0={280} x1={880} y1={378} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, transform: `translateY(${waveRise + waveBob * 0.6}px)`,
          filter: 'url(#liquid)',
          clipPath: `inset(0 ${(1 - waveEase) * 100}% 0 0)`,
        }}>
          <Crop x0={128} y0={280} x1={880} y1={378} />
        </div>

        {/* wordmark */}
        {letters.map((L) => (
          <div key={`${L.y0}-${L.x0}`} style={{
            position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
            transform: `translateY(${L.y}px) rotate(${L.tilt}deg) scale(${L.sq})`,
            transformOrigin: `${(L.x0 + L.x1) / 2}px ${L.y1}px`,
            opacity: L.op,
          }}>
            <Crop x0={L.x0} y0={L.y0} x1={L.x1} y1={L.y1}
              imgStyle={L.y0 === 389 ? { filter: 'brightness(0) invert(1) sepia(0.10) brightness(1.03) saturate(0.7)' } : null} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CumbucoLogoAnim(props) {
  return (
    <CompositionStage
      width={1920}
      height={1080}
      bg="#07161E"
      scenes={window.OM_SCENES}
      playback={window.OM_PLAYBACK}
    >
      <Piece spinSpeed={props.spinSpeed} glow={props.glow} />
    </CompositionStage>
  );
}

window.CumbucoLogoAnim = CumbucoLogoAnim;
})();
