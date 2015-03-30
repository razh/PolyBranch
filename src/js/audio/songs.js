import { Tone } from 'tone';

const keyCodeToFrequency = (() => {
  const octave = 4;

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

const keys = [];
let prevKeyCode = 0;

const onKeyDown = (() => {
  let listener;

  return synth => {
    document.removeEventListener( 'keydown', listener );

    listener = event => {
      const { keyCode } = event;
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
        if ( frequency && keyCode === prevKeyCode ) {
          synth.triggerRelease();
        }
      }
    };

    document.addEventListener( 'keyup', listener );
  };
})();

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

  Tone.Transport.start();
  setTimeout( () => Tone.Transport.stop(), 2000 );
}

const songs = {
  songA,
  songB
};

export default songs;
