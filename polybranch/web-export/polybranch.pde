/* @pjs globalKeyEvents=true; 
 */

PVector[] tris = {
      new PVector(200,200),
      new PVector(400,200),
      new PVector(0,100)
    };
    
boolean[] keys = new boolean[4];
      
int originX;
int originY;

boolean paused;
                
//Tree testTree;

Player player;
Game g;

PVector focalPoint;

void setup(){
  paused = false;
  size(800,800);
  //frameRate(30);
  originX = width/2;
  originY = height/2;
  
  
  imageMode(CENTER);
  rectMode(CENTER);
  ellipseMode(CENTER);
  focalPoint = new PVector(width/2,height/2);
  noStroke();
  background(255);
  //testTree = new Tree(5, bob);
  
  player = new Player();
  g = new Game();
  Layer layer = new Layer(16, width, height);
}

void draw(){
  println("LEVEL "+g.level+"  SCORE:"+g.score+"  SPEED "+g.speed);
  if(keys[0] || keys[1]){
    if(keys[0]){
      //originY += player.speed;
      player.velY += 0.3;
    }
    if(keys[1]){
      //originY -= player.speed;
      player.velY -= 0.3;
    }
  }else if(player.velY != 0.0){
    if(player.velY > 0){
      player.velY -= 0.5;
      if(player.velY < 0){
        player.velY = 0;
      }
    }else if(player.velY < 0){
      player.velY += 0.5;
      if(player.velY > 0){
        player.velY = 0;
      } 
    }
   
//    float brakes = (player.velY > 0) ? -0.5 : 0.5;
//    player.velY += brakes;
  }
  if(keys[2] || keys[3]){
    if(keys[2]){
      //originX += player.speed;
      player.velX += 0.3;
    }
    if(keys[3]){
      //originX -= player.speed;
      player.velX -= 0.3;
    }
  }else if(player.velX != 0.0){
    if(player.velX > 0){
      player.velX -= 0.5;
      if(player.velX < 0){
        player.velX = 0;
      }
    }else if(player.velX < 0){
      player.velX += 0.5;
      if(player.velX > 0){
        player.velX = 0;
      } 
    }
    
    //    float brakes = (player.velX > 0) ? -0.5 : 0.5;
//    player.velX += brakes;
  }
  
  
  originX += player.velX;
  originY += player.velY;
  
  if(dist(player.pos.x, player.pos.y, originX, originY) > (height/2 - player.r - 8)){
    float a = myAngleBetween(player.pos, new PVector(originX, originY))-PI;
    originX = (int)(player.pos.x + (height/2 - player.r - 8) * cos(a));
    originY = (int)(player.pos.y + (height/2 - player.r - 8) * sin(a));
  }
  
  background(255);
  g.update();  
}


//testtesttest
void mousePressed(){
 player.speed++;
}

void keyPressed(){
  if (keyCode == UP || key == 'w' || key == 'W') {
    keys[0] = true;
  }
  if (keyCode == DOWN || key == 's' || key == 'S') {
    keys[1] = true;
  }
  if (keyCode == LEFT || key == 'a' || key == 'A') {
    keys[2] = true;
  }
  if (keyCode == RIGHT || key == 'd' || key == 'D') {
    keys[3] = true;
  }
  
  if(key == 'a'){
    player.r -= 0.5;
  }
  if(key == 'z'){
    player.r += 0.5;
  }
  
  if(key == 's'){
    g.numBranches ++;
  }
  if(key == 'x'){
    g.numBranches --;
  }
  
  if(key == 'p'){
    if(paused){
      loop();
      paused = false;
    }else{
      noLoop();
      paused = true;
    }
  }

}

void keyReleased(){
  if (keyCode == UP || key == 'w' || key == 'W') {
    keys[0] = false;
    //player.velY = 0;
  }
  if (keyCode == DOWN || key == 's' || key == 'S') {
    keys[1] = false;
    //player.velY = 0;
  }
  if (keyCode == LEFT || key == 'a' || key == 'A') {
    keys[2] = false;
    //player.velX = 0;
  }
  if (keyCode == RIGHT || key == 'd' || key == 'D') {
    keys[3] = false;
    //player.velX = 0;
  }
}

//void mouseMoved(){
//  originX = mouseX;
//  originY = mouseY;
//  //if(dist(int(mouseX),int(mouseY), int(width/2), int(height/2)) < width/2){
//    
//  //}
//}


//utility functions!
float myAngleBetween (PVector myPVector1, PVector myPVector2) {
  float a = atan2(myPVector1.y-myPVector2.y, myPVector1.x-myPVector2.x);
  if (a<0) { a+=TWO_PI; }
  return a;
}


void drawPolygon(float cX, float cY, float r, int numSides, float weight, color cIn){
  float a = TWO_PI / numSides;
  noFill();
  stroke(cIn);
  strokeWeight(weight);
  beginShape();
  for(int i = 0; i < numSides; i++){
    vertex(cX + r * cos(a*i), cY + r * sin(a*i));
  }
  endShape(CLOSE);
}

float easeInExpo(float x, float t, float b, float c, float d) {
  return (t==0) ? b : c * pow(2, 10 * (t/d - 1)) + b;
}
//create some kind of tree or branch object that takes in an initial triangle and a number of limbs
//function limb(PVector baseA, PVector baseB){}
class Branch{
  PVector[] verticies = new PVector[3];
  PVector[] easedVerticies = new PVector[3];
  color col;
  int hu,sat,br,alph;
  
  Branch(){
    verticies[0] = new PVector(0,0);
    verticies[1] = new PVector(0,0);
    verticies[2] = new PVector(0,0);
    
    //initialized eased verticies as blanks
    easedVerticies[0] = new PVector(0,0);
    easedVerticies[1] = new PVector(0,0);
    easedVerticies[2] = new PVector(0,0);
    
    hu = 0;
    sat = 0;
    br = (int)random(100,200);
    alph = 255;
  }
  
  Branch(PVector a, PVector b, PVector c){
    verticies[0] = a;
    verticies[1] = b;
    verticies[2] = c;
    
    //initialized eased verticies as blanks
    easedVerticies[0] = new PVector(0,0);
    easedVerticies[1] = new PVector(0,0);
    easedVerticies[2] = new PVector(0,0);
    
    hu = 0;
    sat = 0;
    br = (int)random(50,200);
    alph = 255;
  }
  
  public void setPos(float oX, float oY, float w, float h, float easedDist){
    easedVerticies[0].x = verticies[0].x*easedDist+(oX-(w)/2);
    easedVerticies[0].y = verticies[0].y*easedDist+(oY-h/2);
    easedVerticies[1].x = verticies[1].x*easedDist+(oX-(w)/2);
    easedVerticies[1].y = verticies[1].y*easedDist+(oY-h/2);
    easedVerticies[2].x = verticies[2].x*easedDist+(oX-(w)/2);
    easedVerticies[2].y = verticies[2].y*easedDist+(oY-h/2);
  }
  
  public void render(float oX, float oY, float w, float h, float easedDist){
      alph = (easedDist > 2) ? (int)map(easedDist, 2, 8, 255, 0) : 255;
      fill(br,alph);
      noStroke();
      triangle(easedVerticies[0].x, easedVerticies[0].y,
                easedVerticies[1].x, easedVerticies[1].y,
                easedVerticies[2].x, easedVerticies[2].y);
  }
  
  //collision detection functions
  public void playerOverlap(){
    if(dist(player.pos.x,player.pos.y,easedVerticies[0].x,easedVerticies[0].y) < player.r ||
        dist(player.pos.x,player.pos.y,easedVerticies[1].x,easedVerticies[1].y) < player.r ||
        dist(player.pos.x,player.pos.y,easedVerticies[2].x,easedVerticies[2].y) < player.r){
      //return true;
      br = 0;
      g.gameOver();
    }else if(PointInTriangle(player.pos.x,player.pos.y,easedVerticies[2].x,easedVerticies[2].y,easedVerticies[1].x,easedVerticies[1].y,easedVerticies[0].x,easedVerticies[0].y)){
      //return true;
      br = 0;
      g.gameOver();
    }else if(circleLineIntersect(player.pos.x,player.pos.y, player.r, easedVerticies[0].x,easedVerticies[0].y, easedVerticies[1].x,easedVerticies[1].y) ||
              circleLineIntersect(player.pos.x,player.pos.y, player.r, easedVerticies[1].x,easedVerticies[1].y, easedVerticies[2].x,easedVerticies[2].y) ||
              circleLineIntersect(player.pos.x,player.pos.y, player.r, easedVerticies[2].x,easedVerticies[2].y, easedVerticies[0].x,easedVerticies[0].y)){
      //return true;
      br = 0;
      g.gameOver();
    }else{
      //return false;
    }
  }
  
  float sign(float p1x, float p1y, float p2x, float p2y, float p3x, float p3y){
    return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
  }
  
  boolean PointInTriangle(float ptx, float pty, float v1x, float v1y, float v2x, float v2y, float v3x, float v3y){
    boolean b1, b2, b3;
  
    b1 = sign(ptx, pty, v1x, v1y, v2x, v2y) < 0.0;
    b2 = sign(ptx, pty, v2x, v2y, v3x, v3y) < 0.0;
    b3 = sign(ptx, pty, v3x, v3y, v1x, v1y) < 0.0;
  
    return ((b1 == b2) && (b2 == b3));
  }
  
  // Thanks, Casey!! :)
  // Code adapted from Paul Bourke:
  // http://local.wasp.uwa.edu.au/~pbourke/geometry/sphereline/raysphere.c
  boolean circleLineIntersect(float cx, float cy, float cr, float x1, float y1, float x2, float y2) {
    float dx = x2 - x1;
    float dy = y2 - y1;
    float a = dx * dx + dy * dy;
    float b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
    float c = cx * cx + cy * cy;
    c += x1 * x1 + y1 * y1;
    c -= 2 * (cx * x1 + cy * y1);
    c -= cr * cr;
    float bb4ac = b * b - 4 * a * c;
   
    //println(bb4ac);
   
    if (bb4ac < 0) {  // Not intersecting
      return false;
    }
    else {
       
      float mu = (-b + sqrt( b*b - 4*a*c )) / (2*a);
      float ix1 = x1 + mu*(dx);
      float iy1 = y1 + mu*(dy);
      mu = (-b - sqrt(b*b - 4*a*c )) / (2*a);
      float ix2 = x1 + mu*(dx);
      float iy2 = y1 + mu*(dy);
   
      // The intersection points
      //ellipse(ix1, iy1, 10, 10);
      //ellipse(ix2, iy2, 10, 10);
       
      float testX;
      float testY;
      // Figure out which point is closer to the circle
      if (dist(x1, y1, cx, cy) < dist(x2, y2, cx, cy)) {
        testX = x2;
        testY = y2;
      } else {
        testX = x1;
        testY = y1;
      }
       
      if (dist(testX, testY, ix1, iy1) < dist(x1, y1, x2, y2) || dist(testX, testY, ix2, iy2) < dist(x1, y1, x2, y2)) {
        return true;
      } else {
        return false;
      }
    }
  }
}
class Layer{
  public int numSides;
  int startVertex;
  Tree tree;
  int layerWidth, layerHeight;
  int ringWeight = 6;
  float distance;
  float easedDistance;
  boolean passed = false;
  
  Layer(int numSidesIn, int w, int h){
    numSides = numSidesIn;
    layerWidth = w;
    layerHeight = h;
    distance = 1;

    startVertex = int(random(0, numSides));
    
    
    float aX = (layerWidth/2) + (layerWidth/2 - ringWeight/2) * cos((TWO_PI/numSides)*startVertex);
    float aY = (layerHeight/2) + (layerHeight/2 - ringWeight/2) * sin((TWO_PI/numSides)*startVertex);
    float bX = (layerWidth/2) + (layerWidth/2 - ringWeight/2) * cos((TWO_PI/numSides)*(startVertex-1));
    float bY = (layerHeight/2) + (layerHeight/2 - ringWeight/2) * sin((TWO_PI/numSides)*(startVertex-1));
    
    
//    tree = new Tree(11, new Branch(
//                new PVector(aX, aY),
//                new PVector(bX, bY),
//                new PVector(lerp(aX,layerWidth/2,0.7), lerp(aY,layerHeight/2,0.7))));
    tree = new Tree();
    //drawPolygon(layerWidth/2, layerHeight/2, layerWidth/2 - ringWeight/2, numSides, ringWeight, color(255,0,0,0.5));
    
  }
  
  public void updateDist(float increment){
    distance += increment;
//    if(easedDistance > 4){
//      reset();
//    }
    easedDistance = easeInExpo(distance, distance, 0,1,1);
    if(easedDistance >= 0.999 && easedDistance <= 1.02){
      tree.checkCollisions();
    }else if(easedDistance > 1 && !passed && (tree.branches[0].verticies[0].x != 0 && tree.branches[0].verticies[0].y != 0)){
      passed = true;
      g.score += 100;
    }
    
  }
  
  public int getNumSides(){ return numSides;}
  
  public void reset(){
    distance = 0;
    easedDistance = 0;
    passed = false;
    tree.reset();
  }
  
  public void render(){
    //fill(255,100);
    //rect(lerp(width/2, originX, easedDistance),lerp(height/2, originY,easedDistance), width*2*easedDistance, height*2*easedDistance);
    
    //image(pg, lerp(width/2, originX, easedDistance),lerp(height/2, originY,easedDistance), width*2*easedDistance, height*2*easedDistance);
    tree.render(lerp(width/2, originX, easedDistance),lerp(height/2, originY,easedDistance), layerWidth*easedDistance, layerHeight*easedDistance, easedDistance);
    
    color c = (easedDistance > 1) ? color(0,0,255) : color(100);
    drawPolygon(lerp(width/2, originX, easedDistance), lerp(height/2, originY,easedDistance), (layerWidth*easedDistance)/2 - (ringWeight*easedDistance)/2, numSides, ringWeight*easedDistance, c);
  }
  
  
  //
  class Tree{
    Branch branches[];
    int numBranches;
    int index = 0;
    float trunkLen;
    Tree(int numBranchesIn, Branch trunk){
      numBranches = numBranchesIn;
      branches = new Branch[16];
      println(numSides);
      for(int i = 0; i < branches.length; i++){
        branches[i] = new Branch();
      }
      
      branches[index] = trunk;
      index ++;
      trunkLen = dist(lerp(trunk.verticies[0].x, trunk.verticies[1].x, 0.5), lerp(trunk.verticies[0].y, trunk.verticies[1].y, 0.5), trunk.verticies[2].x, trunk.verticies[2].y);
      this.populateRandomBranches(branches[0], (random(1)));
      //println("trunks is "+trunkLen);
    }
    
    Tree(){
      numBranches = 0;
      branches = new Branch[16];
      for(int i = 0; i < branches.length; i++){
        branches[i] = new Branch();
      }
    }
    
    void populateRandomBranches(Branch trunkIn, float sides){
        int side;
        if(sides > 0.2){
         side = 2; 
        }else{
          side = int(random(2));
        }
        
        if((side == 1 || side == 2) && index < numBranches){
          float angle = myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[0])+random(HALF_PI);
          float len = dist(trunkIn.verticies[2].x, trunkIn.verticies[2].y, trunkIn.verticies[0].x, trunkIn.verticies[0].y) * 0.7;
          
          if(len > (trunkLen*0.4)){
            
            //check if the random angle will fit inside the circle
            if(dist((trunkIn.verticies[2].x + len * cos(angle)), (trunkIn.verticies[2].y + len * sin(angle)),width/2,height/2) < width/2){
              //println(index);
              branches[index] = new Branch(
                        new PVector(trunkIn.verticies[2].x, trunkIn.verticies[2].y),
                        new PVector(lerp(trunkIn.verticies[2].x, trunkIn.verticies[1].x, 0.3), lerp(trunkIn.verticies[2].y, trunkIn.verticies[1].y, 0.3)),
                        new PVector((trunkIn.verticies[2].x + len * cos(angle)), (trunkIn.verticies[2].y + len * sin(angle))));
                        index ++;
                        populateRandomBranches(branches[index-1], (random(1)));
                  //check if the min or max angle fit inside the area
            }else if(dist((trunkIn.verticies[2].x + len * cos(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[0])+HALF_PI)), (trunkIn.verticies[2].y + len * sin(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[0])+HALF_PI)),width/2,height/2) < width/2 || 
                        dist((trunkIn.verticies[2].x + len * cos(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[0]))), (trunkIn.verticies[2].y + len * sin(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[0]))),width/2,height/2) < width/2){
              populateRandomBranches(trunkIn, 1);
            }//otherwise don't do it.
          
          }
                    
        }
        
        
        if((side == 0 || side == 2) && index < numBranches){
          
          float angle = myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[1])-random(HALF_PI);
          float len = dist(trunkIn.verticies[2].x, trunkIn.verticies[2].y, trunkIn.verticies[1].x, trunkIn.verticies[1].y) * 0.7;
          if(len > (trunkLen*0.4)){
            
            //check if the random angle will fit inside the circle
            if(dist((trunkIn.verticies[2].x + len * cos(angle)), (trunkIn.verticies[2].y + len * sin(angle)),width/2,height/2) < width/2){
              //println(index);
              branches[index] = new Branch(
                        new PVector(lerp(trunkIn.verticies[2].x, trunkIn.verticies[0].x, 0.3), lerp(trunkIn.verticies[2].y, trunkIn.verticies[0].y, 0.3)),
                        new PVector(trunkIn.verticies[2].x, trunkIn.verticies[2].y),
                        new PVector((trunkIn.verticies[2].x + len * cos(angle)), (trunkIn.verticies[2].y + len * sin(angle))));
                        index ++;
                        populateRandomBranches(branches[index-1], (random(1)));
            }else if(dist((trunkIn.verticies[2].x + len * cos(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[1])-HALF_PI)), (trunkIn.verticies[2].y + len * sin(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[1])-HALF_PI)), width/2, height/2) < width / 2 ||
                      dist((trunkIn.verticies[2].x + len * cos(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[1]))), (trunkIn.verticies[2].y + len * sin(myAngleBetween(trunkIn.verticies[2], trunkIn.verticies[1]))), width/2, height/2) < width / 2){
              populateRandomBranches(trunkIn, 0);
            }
          
          }
        }
        //if(index < numBranches){
  //        if(side == 2){
  //          populateRandomBranches(branches[index-1], int(random(3)));
  //          populateRandomBranches(branches[index-2], int(random(3)));
  //        }else{
  //          populateRandomBranches(branches[index-1], int(random(3)));
  //        }
        //}
  
    }
    
    void reset(){
      index = 1;
      numBranches = g.numBranches;
      for(int i = 1; i < numBranches; i++){
          branches[i].br = (int)random(50,200);
          branches[i].verticies[0].x = 0;
          branches[i].verticies[0].y = 0;
      }
      
      startVertex = int(random(0, numSides));
    
    
      float aX = (layerWidth/2) + (layerWidth/2 - ringWeight/2) * cos((TWO_PI/numSides)*startVertex);
      float aY = (layerHeight/2) + (layerHeight/2 - ringWeight/2) * sin((TWO_PI/numSides)*startVertex);
      float bX = (layerWidth/2) + (layerWidth/2 - ringWeight/2) * cos((TWO_PI/numSides)*(startVertex-1));
      float bY = (layerHeight/2) + (layerHeight/2 - ringWeight/2) * sin((TWO_PI/numSides)*(startVertex-1));
      
      branches[0] = new Branch(
                  new PVector(aX, aY),
                  new PVector(bX, bY),
                  new PVector(lerp(aX,width/2,0.7), lerp(aY,width/2,0.7)));
      trunkLen = dist(lerp(branches[0].verticies[0].x, branches[0].verticies[1].x, 0.5), lerp(branches[0].verticies[0].y, branches[0].verticies[1].y, 0.5), branches[0].verticies[2].x, branches[0].verticies[2].y);
      populateRandomBranches(branches[0], 2);
    }
    
    void checkCollisions(){
      for(int i = 0; i < numBranches; i++){
        if(branches[i].verticies[0].x != 0 && branches[i].verticies[0].y != 0){
          //branches[i].render(context);
          branches[i].playerOverlap();
        }
      }
    }
    
    void render(float oX, float oY, float w, float h, float easedDist){
      for(int i = 0; i < numBranches; i++){
        if(branches[i].verticies[0].x != 0 && branches[i].verticies[0].y != 0){
          //branches[i].render(context);
          branches[i].setPos(oX, oY, w, h, easedDist);
          branches[i].render(oX, oY, w, h, easedDist);
        }
      }
    }
  }

}
class Player{
  
  PVector pos;
  float r;
  int speed;
  float velX, velY;
  
  Player(){
    pos = new PVector(width/2,height/2);
    r = 20;
    speed = 6;
  }
  
  public void reset(){
    pos.x = width/2;
    pos.y = width/2;
    r = 20;
    speed = 6;
    velX = velY = 0;
  }
}
//tree has been moved inside layer as an internal class
class Game{
  ArrayList layers;
  String origin;
  boolean drawnPlayer;
  int score;
  int level;
  
  int numBranches;
  
  String state; //"notPlaying" "playing" "paused"
  
  float speed;

  Game(){
    score = 0;
    origin = "I EXIST";
    layers = new ArrayList();
    
    drawnPlayer = false;
    
    numBranches = 6;
    level = 1;
    speed = 0.0025;
    
    //make 6 layers
    for(int i = 0; i < 13; i++){
      layers.add(new Layer(16, width, height));
    }
    //set the distance var for these 6 layers
    for(int i = layers.size(); i > 0; i--){
      Layer layer = (Layer) layers.get(i-1);
      //println(1.0/(i));
      layer.distance = 1.3/layers.size()*i;
      layer.easedDistance = easeInExpo(layer.distance, layer.distance, 0,1,1);
      //println(easeInExpo(1.3, 1.3, 0,1,1));
    }
    
    //println("game has "+layers.size());
  }
  
  
  public void update(){
    drawnPlayer = false;
    
    for(int i = 0; i < layers.size(); i++){
      Layer layer = (Layer) layers.get(i);
      if(layer.easedDistance > 8 && i == layers.size()-1){
        layers.add(0, layer);
        layers.remove(layers.size()-1);
        checkLevel();
        layer.reset();
        
      }else{
        layer.updateDist(speed);
        if(layer.easedDistance >= 1 && !drawnPlayer){
          noStroke();
          fill(50,255);
          ellipse(width/2,height/2,player.r*2,player.r*2);
          drawPolygon(lerp(width/2, originX, 1), lerp(height/2, originY,1), width/2, 16, 6, color(0,0,0));
          drawnPlayer = true;
        }
        layer.render();
      }
    }
  }
  
  void checkLevel(){
    if(score > 18000){
      level = 8;
      numBranches = 13;
      //speed = 0.004;
    }else if(score > 12000){
      level = 7;
      numBranches = 12;
      //speed = 0.004;
    }else if(score > 8000){
      level = 6;
      numBranches = 11;
      //speed = 0.004;
    }else if(score > 5000){
      level = 5;
      numBranches = 10;
      //speed = 0.004;
    }else if(score > 3000){
      level = 4;
      numBranches = 9;
      //speed = 0.004;
    }else if(score > 1500){
      level = 3;
      numBranches = 8;
      //speed = 0.0035;
    }else if(score > 500){
      level = 2;
      numBranches = 7;
      //speed = 0.003;
    }else{
      level = 1;
      numBranches = 6;
      //speed = 0.0025;
    }
    
    if(score < 30000){
      speed = map(score, 0,30000, 0.0025,0.009);
    }
  }
  
  public void gameOver(){
    noLoop();
  }
  

  
//  public void display(){
//    for(int i = 0; i < layers.size(); i++){
//      Layer layer = (Layer) layers.get(i);
//      layer.render();
//    }
//  }
}
