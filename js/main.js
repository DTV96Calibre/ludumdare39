//asteroid clone (core mechanics only)
//arrow keys to move + x to shoot

var DEBUG = true;

var bullets;
var asteroids;
var ship;
var energyBar;
var shipImage, bulletImage, particleImage, energyBarImage;

var currentAsteroidDensity = 10;
var currentStarDensity = 1;
var nearestStar = null;

var MARGIN = 40;
var SHIP_SPRITE_ROTATION = 90;
var KEY_E = 69;
var KEY_W = 81;
var GRAVITY_CONST = 0.01;
var STAR_MASS = 75000;
var ASTEROID_MAX_SPEED = 30;

var MIN_ZOOM = 0.5; // 1 is no zooming either in or out
var MAX_ZOOM = 0.25; // Smaller means zoomed further out

var tick = 0;
var MAX_TICK = 60;

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  asteroids = new Group();
  bullets = new Group();
  stars = new Group();

  // Create stars
  for(var i = 0; i < currentStarDensity; i++){
    var ang = random(360);
    var px = width/2 + 1000 * cos(radians(ang));
    var py = height/2+ 1000 * sin(radians(ang));
    createStar(px, py);
  }

  // Create asteroids
  for(var i = 0; i < currentAsteroidDensity; i++) {
    var ang = random(360);
    var px = width/2 + 1000 * cos(radians(ang));
    var py = height/2+ 1000 * sin(radians(ang));
    createAsteroid(floor(random(0,3)), px, py);
    }

  //bulletImage = loadImage("assets/asteroids_bullet.png");
  shipImage = loadImage("assets/ship.png");
  //particleImage = loadImage("assets/asteroids_particle.png");
  ship = createSprite(width/2, height/2);
  ship.rotation -= 90;
  ship.maxSpeed = 20;
  //ship.friction = .98;
  ship.setCollider("circle", 0,0, 20);
  ship.mass = 75;
  ship.addImage("normal", shipImage);
  ship.debug = DEBUG;

  energyBarImage = loadImage("assets/left_hbar.png");
  energyBar = createSprite(0, 0);
  energyBar.addImage("normal", energyBarImage);
  energyBar.visible = false; // prevent drawSprites from drawing relative to world coords
  //ship.addAnimation("thrust", "assets/ship.png");
  nearestStar = stars[0];

}

function draw() {
  camera.position = ship.position;
  camera.zoom = map(ship.getSpeed(), 0, ship.maxSpeed, MIN_ZOOM, MAX_ZOOM);//0.25; // Scale zoom level with speed of ship
  background(0);

  fill(255);

  // limitSpritesToBox();

  simulateAsteroidGravity();
  // simulateInterStellarGravity();
  calcGravOnShip();
  // asteroids.overlap(bullets, asteroidHit);
  asteroids.overlap(stars, destroyAsteroid);
  ship.overlap(stars, destroyShip);
  ship.bounce(asteroids);
  processInput();
  drawSprites();

  // Every 20 ticks, calculate nearest star
  if ((tick + 1) % 20 == 0){
    determineNearestStar();
  }
  drawLineToNearestStar();

  // Draw UI elements
  camera.off();
  textAlign(CENTER);
  text("Controls: Arrow Keys", width/2, 20);
  text("CTRL+R to Reset", width/2, 40);
  energyBar.visible = true;
  energyBar.position.x = 30;
  energyBar.position.y = height/2;
  energyBar.draw();
  energyBar.visible = false;
  camera.on();

  tick += 1;
  if (tick > MAX_TICK){
    tick = 0;
  }
}

/* Simulate gravity between each asteroid and each star
 * Assumes stars are too massive for asteroids to effect
 * Assumes ship and asteroids are not massive enough to attract each other
 */
function simulateAsteroidGravity(){
  for (var i=0; i<asteroids.length; i++) {
    var asteroid = asteroids[i];
    for (var j=0; j<stars.length; j++) {
      var star = stars[j];
      var distance = calculateDistance(star.position.x, star.position.y, asteroid.position.x, asteroid.position.y);
      asteroid.attractionPoint(star.mass / sq(distance), star.position.x, star.position.y); // F=MA so remove asteroid mass in calc
    }
  }
}

function simulateInterStellarGravity(){
  var s1;
  var s2;
  var magnitude;
  var distance;
  for (var i = 0; i < stars.length; i++){
    for (var j = 0; j < stars.length; j++){
      s1 = stars[i];
      s2 = stars[j];
      distance = calculateDistance(s1.position.x, s1.position.y, s2.position.x, s2.position.y);
      magnitude = s1.mass * s2.mass / sq(distance);
      s1.attractionPoint(s2.mass/sq(distance), s2.position.x, s2.position.y);
      s2.attractionPoint(s1.mass/sq(distance), s1.position.x, s1.position.y);

    }
  }
}

/* Sets global nearestStar to the star closest to the ship.
 */
function determineNearestStar(){
  var nearestDistance = calculateDistance(nearestStar.position.x, nearestStar.position.y,
                                          ship.position.x, ship.position.y);
  var currentDistance = 0;
  for (var i = 0; i < stars.length; i++){
    currentDistance = calculateDistance(stars[i].position.x, stars[i].position.y,
                                        ship.position.x, ship.position.y);
    if (currentDistance < nearestDistance){
      nearestDistance = currentDistance;
      nearestStar = stars[i];
    }
  }
}

function drawLineToNearestStar(){
  stroke(127);
  line(ship.position.x, ship.position.y, nearestStar.position.x, nearestStar.position.y);
  stroke(0);
}

function processInput(){
  if(keyDown(LEFT_ARROW))
    ship.rotation -= 4;
  if(keyDown(RIGHT_ARROW))
    ship.rotation += 4;
  if(keyDown(UP_ARROW)){
    ship.addSpeed(.2, ship.rotation - SHIP_SPRITE_ROTATION);
    //ship.changeAnimation("thrust");
    }
  if(keyDown(DOWN_ARROW)){
    ship.addSpeed(-.05, ship.rotation - SHIP_SPRITE_ROTATION);
    //ship.changeAnimation("thrust");
    }
  if(keyDown(KEY_E)){
    ship.addSpeed(.1, ship.rotation - SHIP_SPRITE_ROTATION + 90);
  }
  if(keyDown(KEY_W)){
    ship.addSpeed(.1, ship.rotation - SHIP_SPRITE_ROTATION - 90);
  }
  // if(keyWentDown("x"))
  //   {
  //   var bullet = createSprite(ship.position.x, ship.position.y);
  //   bullet.addImage(bulletImage);
  //   bullet.setSpeed(10+ship.getSpeed(), ship.rotation);
  //   bullet.life = 30;
  //   bullets.add(bullet);
  //   }
  else{
    ship.changeAnimation("normal");
  }
}

function calculateDistance(x1, y1, x2, y2){
  return sqrt(sq(x1 - x2) + sq(y1 - y2));
}

function calcGravOnShip(){
  var i = 0;
  var length = stars.length;
  var star; // current star providing gravitation
  var distance;
  for(var i = 0; i < length; i++){
    star = stars[i];
    distance = calculateDistance(star.position.x, star.position.y, ship.position.x, ship.position.y);
    ship.attractionPoint(star.mass / sq(distance), star.position.x, star.position.y);
  }
}

function createAsteroid(type, x, y) {
  var a = createSprite(x, y);
  var img  = loadImage("assets/asteroid"+floor(random(0,3))+".png");
  a.addImage(img);
  a.setSpeed(2.5-(type/2), random(360));
  a.maxSpeed = ASTEROID_MAX_SPEED;
  a.rotationSpeed = .5;
  a.debug = DEBUG;
  a.type = type;

  if(type == 2)
    a.scale = .6;
  if(type == 1)
    a.scale = .3;

  a.mass = 2+a.scale;
  a.setCollider("circle", 0, 0, 50);
  asteroids.add(a);
  return a;
}

function createStar(x, y) {
  var a = createSprite(x, y);
  var img = loadImage("assets/star.png");
  a.addImage(img);
  a.scale = 10;
  a.setSpeed(.5, random(360));
  a.rotationSpeed = 0.1;
  a.mass = STAR_MASS;
  a.setCollider("circle", 0, 0, 50);
  a.debug = DEBUG;
  stars.add(a);
  return a;
}

function asteroidHit(asteroid, bullet) {
  var newType = asteroid.type-1;

  if(newType>0) {
    createAsteroid(newType, asteroid.position.x, asteroid.position.y);
    createAsteroid(newType, asteroid.position.x, asteroid.position.y);
    }

  for(var i=0; i<10; i++) {
    var p = createSprite(bullet.position.x, bullet.position.y);
    p.addImage(particleImage);
    p.setSpeed(random(3,5), random(360));
    p.friction = 0.95;
    p.life = 15;
    }

  bullet.remove();
  asteroid.remove();
}

function destroyAsteroid(asteroid){
  asteroid.remove();
}
function destroyShip(ship){
  ship.remove();
}

/* Causes sprites that move outside of box to appear on the other side of the box
 * TODO: Remove this function entirely
 */
function limitSpritesToBox(){
  for(var i=0; i<allSprites.length; i++) {
    var s = allSprites[i];
    if(s.position.x<-MARGIN) s.position.x = width+MARGIN;
    if(s.position.x>width+MARGIN) s.position.x = -MARGIN;
    if(s.position.y<-MARGIN) s.position.y = height+MARGIN;
    if(s.position.y>height+MARGIN) s.position.y = -MARGIN;
  }
}
