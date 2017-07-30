//asteroid clone (core mechanics only)
//arrow keys to move + x to shoot

var bullets;
var asteroids;
var ship;
var shipImage, bulletImage, particleImage;

var currentAsteroidDensity = 10;
var currentStarDensity = 1;

var MARGIN = 40;
var SHIP_SPRITE_ROTATION = 90;
var KEY_E = 69;
var KEY_W = 81;
var GRAVITY_CONST = 0.01;
var STAR_MASS = 1000;

function setup() {
  createCanvas(800,600);


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
  ship.maxSpeed = 6;
  //ship.friction = .98;
  ship.setCollider("circle", 0,0, 20);
  ship.mass = 75;

  ship.addImage("normal", shipImage);
  //ship.addAnimation("thrust", "assets/ship.png");

}

function draw() {
  camera.position = ship.position;
  camera.zoom = 0.25;
  background(0);

  fill(255);
  textAlign(CENTER);
  text("Controls: Arrow Keys + X", width/2, 20);

  // for(var i=0; i<allSprites.length; i++) {
  //   var s = allSprites[i];
  //   if(s.position.x<-MARGIN) s.position.x = width+MARGIN;
  //   if(s.position.x>width+MARGIN) s.position.x = -MARGIN;
  //   if(s.position.y<-MARGIN) s.position.y = height+MARGIN;
  //   if(s.position.y>height+MARGIN) s.position.y = -MARGIN;
  // }

  // Simulate gravity between each asteroid and each star
  // Assume stars are too massive for asteroids to effect
  // Assume ship and asteroids are not massive enough to attract each other
  for(var i=0; i<asteroids.length; i++) {
    var asteroid = asteroids[i];
    for(var j=0; j<stars.length; j++) {
      var star = stars[j];
      var distance = calculateDistance(star.position.x, star.position.y, asteroid.position.x, asteroid.position.y);
      asteroid.attractionPoint(star.mass * asteroid.mass / sq(distance), star.position.x, star.position.y);
    }
  }

  calcGravOnShip();

  // for(var i=0; i<allSprites.length; i++) {
  //   var s = allSprites[i];
  //   ship.attractionPoint(.01, s.position.x, s.position.y);
  // }


  asteroids.overlap(bullets, asteroidHit);


  ship.bounce(asteroids);

  processInput();



  drawSprites();

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
    ship.attractionPoint(star.mass * ship.mass / sq(distance), star.position.x, star.position.y);
  }
}

function createAsteroid(type, x, y) {
  var a = createSprite(x, y);
  var img  = loadImage("assets/asteroid"+floor(random(0,3))+".png");
  a.addImage(img);
  a.setSpeed(2.5-(type/2), random(360));
  a.rotationSpeed = .5;
  //a.debug = true;
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
  a.setCollider("circle", 0, 0, 500);
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
