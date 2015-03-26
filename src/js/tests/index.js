import audio from './audio';
import texture from './texture';
import tree from './tree';

switch ( window.__test__ ) {
  case 'audio':
    audio();
    break;

  case 'texture':
    texture();
    break;

  case 'tree':
    tree();
    break;
}
