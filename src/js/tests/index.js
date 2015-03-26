import audio from './audio';
import texture from './texture';

switch ( window.__test__ ) {
  case 'audio':
    audio();
    break;

  case 'texture':
    texture();
    break;
}
