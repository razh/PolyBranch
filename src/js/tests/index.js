import audio from './audio';
import cylinder from './cylinder';
import texture from './texture';
import tree from './tree';

switch ( window.__test__ ) {
  case 'audio':
    audio();
    break;

  case 'cylinder':
    cylinder();
    break;

  case 'texture':
    texture();
    break;

  case 'tree':
    tree();
    break;
}
