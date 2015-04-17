import { Tone } from 'tone';
import dat from 'dat-gui';

let octave = 4;

const keys = [];
let prevKeyCode = 0;

const keyCodeToFrequency = (() => {

  // https://github.com/stuartmemo/qwerty-hancock
  const notes = {
    // Lower octave.
    65: 'Cl',
    87: 'C#l',
    83: 'Dl',
    69: 'D#l',
    68: 'El',
    70: 'Fl',
    84: 'F#l',
    71: 'Gl',
    89: 'G#l',
    72: 'Al',
    85: 'A#l',
    74: 'Bl',
    // Upper octave.
    75: 'Cu',
    79: 'C#u',
    76: 'Du',
    80: 'D#u',
    59: 'Eu',
    186: 'Eu',
    222: 'Fu',
    221: 'F#u',
    220: 'Gu'
  };

  const { noteToFrequency } = Tone.prototype;

  return keyCode => {
    const note = notes[ keyCode ];
    if ( !note ) {
      return;
    }

    return noteToFrequency(
      note
        .replace( 'l', octave )
        .replace( 'u', octave + 1 )
    );
  };
})();

const onKeyDown = (() => {
  let listener;

  return synth => {
    document.removeEventListener( 'keydown', listener );

    listener = event => {
      const { keyCode } = event;
      // Only trigger once per keydown event.
      if ( !keys[ keyCode ] ) {
        keys[ keyCode ] = true;

        const frequency = keyCodeToFrequency( keyCode );
        if ( frequency ) {
          synth.triggerAttack( frequency );
          prevKeyCode = keyCode;
        }
      }
    };

    document.addEventListener( 'keydown', listener );
  };
})();

const onKeyUp = (() => {
  let listener;
  let prev;

  return synth => {
    // Clean-up.
    if ( prev ) {
      prev.triggerRelease();
    }

    document.removeEventListener( 'keyup', listener );

    prev = synth;
    listener = event => {
      const { keyCode } = event;
      if ( keys[ keyCode ] ) {
        keys[ keyCode ] = false;

        const frequency = keyCodeToFrequency( keyCode );
        if ( synth instanceof Tone.PolySynth ) {
          synth.triggerRelease( frequency );
        } else if ( frequency && keyCode === prevKeyCode ) {
          // Trigger release if this is the previous note played.
          synth.triggerRelease();
        }
      }
    };

    document.addEventListener( 'keyup', listener );
  };
})();

// Octave controls.
document.addEventListener( 'keydown', event => {
  // Z. Decrease octave range (min: 0).
  if ( event.keyCode === 90 ) { octave = Math.max( octave - 1, 0 ); }
  // X. Increase octave range (max: 10).
  if ( event.keyCode === 88 ) { octave = Math.min( octave + 1, 9 ); }
});

function songA() {
  const synth = new Tone.MonoSynth();
  synth.toMaster();
  synth.volume.value = -10;

  Tone.Transport.setInterval( time => {
    synth.triggerAttackRelease( 'C4', '8n', time );
  }, '4n' );

  Tone.Transport.start();

  setTimeout( () => Tone.Transport.stop(), 2000 );
}

function songB() {
  const synth = new Tone.MonoSynth();
  synth.toMaster();
  synth.volume.value = -10;

  onKeyDown( synth );
  onKeyUp( synth );
}

function songC() {
  const synth = new Tone.PolySynth( 4, Tone.MonoSynth );
  synth.toMaster();
  synth.volume.value = -10;

  onKeyDown( synth );
  onKeyUp( synth );
}

function songD() {
  const synth = new Tone.PolySynth( 4, Tone.FMSynth );
  synth.toMaster();
  synth.volume.value = -10;

  synth.voices.forEach( voice => {
    voice.carrier.oscillator.type = 'square';
    voice.modulator.oscillator.type = 'sine';
  });

  onKeyDown( synth );
  onKeyUp( synth );
}

function songE() {
  const synth = new Tone.PolySynth( 4, Tone.FMSynth );
  const lfo = new Tone.LFO( 8, 0.1, 1 );
  lfo.oscillator.type = 'square';
  lfo.start();

  const gain = Tone.context.createGain();
  const eq = new Tone.EQ( 4, -20, 0 ).toMaster();
  gain.connect( eq );

  synth.connect( gain );
  lfo.connect( gain.gain );

  synth.volume.value = -10;

  synth.voices.forEach( voice => {
    voice.carrier.oscillator.type = 'square';
    voice.modulator.oscillator.type = 'sine';
  });

  onKeyDown( synth );
  onKeyUp( synth );
}

function songF() {
  Tone.Transport.bpm.value = 90;

  const gui = new dat.GUI();

  function addGUI( source, { filterEnvelope } = {} ) {
    gui.add( source.envelope, 'attack', 0.001, 2 );
    gui.add( source.envelope, 'decay', 0.0, 2 );
    gui.add( source.envelope, 'sustain', 0, 1 );
    gui.add( source.envelope, 'release', 0.001, 4 );
    if ( filterEnvelope ) {
      gui.add( source.filterEnvelope, 'attack', 0.001, 2 );
      gui.add( source.filterEnvelope, 'decay', 0.0, 2 );
      gui.add( source.filterEnvelope, 'sustain', 0, 1 );
      gui.add( source.filterEnvelope, 'release', 0.001, 4 );
    }
  }

  const kick2 = new Tone.NoiseSynth({
    filter: {
      type: 'lowpass',
      frequency: 0,
      rolloff: -24,
      Q: 3.7,
      gain: 0
    },
    envelope: {
      attack: 0.024,
      decay: 0.111,
      sustain: 0,
      release: 0.22
    },
    filterEnvelope: {
      min: 200.20,
      max: 3510.98,
      exponent: 2,
      attack: 0.002,
      decay: 0.02,
      sustain: 0.02,
      release: 0.013
    }
  }).toMaster();
  kick2.volume.value = 4;
  kick2.noise.type = 'brown';

  addGUI( kick2, { filterEnvelope: true } );

  const kick = new Tone.MonoSynth({
    portamento: 0.00,
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.0,
      release: 0.2
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 1,
      release: 0.2,
      min: 3000,
      max: 30
    }
  });

  const kick3 = new Tone.FMSynth({
    carrier: {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.1,
        release: 0.1
      }
    },
    modulator: {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.005,
        release: 0.2
      }
    }
  });

  // addGUI( kick3.carrier );
  // addGUI( kick3.modulator );

  const snare = new Tone.NoiseSynth({
    filter: {
      type: 'highpass',
      frequency: 0,
      rolloff: -12,
      Q: 3.7,
      gain: 0
    },
    envelope: {
      attack: 0.01,
      decay: 0.111,
      sustain: 0,
      release: 0.22
    },
    filterEnvelope: {
      min: 819.20,
      max: 3510.98,
      exponent: 2,
      attack: 0.002,
      decay: 0.02,
      sustain: 0.02,
      release: 0.013
    }
  });
  snare.noise.type = 'brown';

  const eq = new Tone.EQ( 4, -20, 0 );

  const compress = new Tone.Compressor({
    threshold: -30,
    ratio: 6,
    attack: 0.001,
    release: 0.01
  }).toMaster();

  kick.connect( eq );
  // kick2.connect( eq );
  kick3.connect( eq );
  snare.connect( eq );
  eq.connect( compress );

  document.addEventListener( 'keydown', event => {
    const { keyCode } = event;
    // 1.
    if ( keyCode === 49 ) {
      kick2.triggerAttackRelease( '8n' );
    }

    // 2.
    if ( keyCode === 50 ) {
      kick3.triggerAttackRelease( 'C2', '4n' );
    }

    // 3.
    if ( keyCode === 51 ) {
      kick.triggerAttackRelease( 'C2', '8n' );
    }

    // 4.
    if ( keyCode === 52 ) {
      snare.triggerAttackRelease( '4n' );
    }

  });
}

export const songG = (() => {
  const synth = new Tone.PolySynth( 3, Tone.FMSynth );
  synth.volume.value = -15;
  synth.voices.forEach( voice => {
    voice.carrier.oscillator.type = 'square';
    voice.modulator.oscillator.type = 'sine';
  });

  const lfo = new Tone.LFO( 8, 0.1, 1 );
  lfo.oscillator.type = 'square';
  lfo.start();

  const gain = Tone.context.createGain();
  const eq = new Tone.EQ( 4, -20, 0 ).toMaster();

  synth.connect( gain );
  lfo.connect( gain.gain );
  gain.connect( eq );

  const A = [ 'A5', 'C5', 'E5' ];
  const E = [ 'E4', 'G4', 'B5' ];
  const F = [ 'F4', 'A5', 'C5' ];
  const C = [ 'C4', 'E4', 'G4' ];
  const G = [ 'G4', 'B5', 'D5' ];
  const B = [ 'B5', 'D5', 'F5' ];

  const chords = [
    A, E, F, C, F, C, F, G,
    A, F, G, C, A, F, C, G,
    A, B, F, G, E, C, F, G
  ];

  let index = 0;
  return () => {
    const chord = chords[ index ];
    synth.triggerAttackRelease( chord[0], '4t' );
    synth.triggerAttackRelease( chord[1], '4t', '+16n' );
    synth.triggerAttackRelease( chord[2], '4t', '+8n' );
    index++;
    index %= chords.length;
  };
})();

const songs = {
  songA,
  songB,
  songC,
  songD,
  songE,
  songF,
  songG
};

export default songs;
