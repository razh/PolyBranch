import { Tone } from 'tone';

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

const songs = {
  songA,
  songB,
  songC,
  songD
};

export default songs;
