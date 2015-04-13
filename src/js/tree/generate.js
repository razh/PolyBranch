import random from 'lodash/number/random';

import {
  TrapezoidalPrism,
  EquilateralTriangularPrism,
  Pyramid
} from './geometry';

class BinaryTreeNode {
  constructor( value ) {
    this.value = value;

    this.parent = undefined;
    this.left   = undefined;
    this.right  = undefined;
  }

  toObject3D( parentWidth = 1, parentDepth = 1 ) {
    if ( !this.left && !this.right ) {
      return new Pyramid( random( 1.5, 3.5 ) );
    }

    const width = parentWidth * random( 0.6, 0.9 );
    const depth = parentDepth * random( 0.5, 0.75 );

    const left  = this.left  && this.left.toObject3D( width, depth );
    const right = this.right && this.right.toObject3D( width, depth );

    const trapezoid = new TrapezoidalPrism( width, random( 2, 3.5 ), depth );
    const triangle  = new EquilateralTriangularPrism( width, depth );

    trapezoid.add( triangle );
    if ( left  ) { triangle.add( left,  'left'  ); }
    if ( right ) { triangle.add( right, 'right' ); }

    return trapezoid;
  }
}

class BinaryTree {
  constructor() {
    this.root = undefined;
  }

  insert( value ) {
    let current = this.root;
    let parent;

    while ( current ) {
      parent = current;
      if ( value < current.value ) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    const node = new BinaryTreeNode( value );
    node.parent = parent;

    if ( !parent ) {
      this.root = node;
    } else if ( value < parent.value ) {
      parent.left = node;
    } else {
      parent.right = node;
    }

    return node;
  }

  toObject3D( width, depth ) {
    const { root } = this;
    if ( !root ) {
      return;
    }

    return root.toObject3D( width, depth );
  }
}

export default function generate( count = 8 ) {
  // Generate a tree by randomly inserting numbers into a binary tree.
  const tree = new BinaryTree();

  // Ensure that the tree is somewhat balanced.
  tree.insert( 0.5 );
  count--;

  while ( count-- > 0 ) {
    // Translate range to (0, 1) with an epsilon value.
    tree.insert( Math.random() + 1e-8 );
  }

  return tree.toObject3D( 1.25, 2 );
}
