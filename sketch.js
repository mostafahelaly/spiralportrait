console.log('ml5 version:', ml5.version);

let bodypix;
let segmentation;
const options = {
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.5, // 0 - 1, defaults to 0.5
}

let cam;

let count;
let roll;

let spirals = [];
let prisms = [];

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.hide();
  image(cam, 0, 0);
  bodypix = ml5.bodyPix(cam, modelReady); // There is no video feed because I am using an image
  background(0);

  count = 0;
  roll = int(random(1, 3));
}

///// bodypix functions /////////////////////////////////////////////////////////////////

function modelReady() {
  console.log('Model Ready!');
  bodypix.segment(gotResults, options); // Image is called for segmentation here
}


function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  console.log(result);
  segmentation = result;

  if (count < 2) {
    count++;
    bodypix.segment(gotResults, options);
  } else {
    if (segmentation !== undefined) {
      image(cam, 0, 0);
      let w = segmentation.segmentation.width;
      let h = segmentation.segmentation.height;
      let data = segmentation.segmentation.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let index = x + y * w; // ***

          if (data[index] == 0) {
            // No body detected
            continue;
          } else {

            if (roll == 1) {
              //Since the number of pixels is extremely large, every 5th pixel generates a Spiral
              if (x % 8 == 0 && y % 4 == 0)
                spirals.push(new Spiral(x, y, random(8), cam.get(x, y)));
              // portrait.get(x,y) gets the color of that specific pixel for the Spiral to use
              // Decreasing the size of the Spirals makes the portrait more defined, while making the Spirals larger decreses the sharpness due to the overlapping spirals
            } else if (roll == 2) {
              if (x % 7 == 0 && y % 4 == 0)
                prisms.push(new Prism(x, y, random(5, 10), random(5, 10), cam.get(x, y)));
            }
          }
        }
      }
    }
    // There is no need to generate a separate image as the Spirals are the ones generating the portrait
  }
}

/////////////////////////////////////////////////////////////////////////////////////////

function draw() {
  // These for-loops need to be in the draw in order to keep the Spirals moving
  if (roll == 1) {
    for (let s of spirals) {
      s.move();
      s.display();
      s.updateLifespan();
    }
  }

  if (roll == 2) {
    for (let p of prisms) {
      p.move();
      p.display();
      p.updateLifespan();
    }
  }

}

/////////////////////////////////////////////////////////////////////////////////////////

class Spiral {
  constructor(x, y, dia, clr) {
    this.x = x;
    this.y = y;

    this.xS = 0.0;
    this.yS = 0.0;

    this.dia = dia;
    this.scl = random(8);
    this.angle = 0;
    this.spd = Math.random();

    this.isDone = false;
    this.lifespan = 1.0; // 100%
    this.lifeReduction = random(0.01, 0.02);

    this.color = clr;
  }

  move() {
    this.xS = this.x + cos(this.angle) * this.scl;
    this.yS = this.y + sin(this.angle) * this.scl;

    this.angle += this.spd;
    this.scl += this.spd;
  }

  display() {
    push();
    noStroke();
    fill(this.color);
    ellipse(this.xS, this.yS, this.dia * this.lifespan, this.dia * this.lifespan);
    pop();
  }

  updateLifespan() {
    if (this.lifespan > 0) {
      this.lifespan -= this.lifeReduction;
    } else {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
}

class Prism {
  constructor(x, y, w, h, clr) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.amp = 8;
    this.yPoint = 0;
    this.timeTotal = 100;
    this.angVelocity = 0.07;
    this.time = 0;
    this.offset = 0;
    this.angle = 0;

    this.clr = clr;

    this.isDone = false;
    this.lifespan = 1.0; // 100%
    this.lifeReduction = random(0.01, 0.02);
  }

  move() {
    angleMode(RADIANS);
    this.yPoint = sin(this.angVelocity * (this.time - this.offset)) * this.amp;
    this.offset += 5;
    this.angle += 0.1;
    this.time += 1;

    this.x += 1;

    if (this.time == this.timeTotal)
      this.time = 0;
  }

  display() {
    push();
    noStroke();
    fill(this.clr);
    angleMode(DEGREES);
    // rotate(this.angle);
    rect(this.x, this.y, this.w * this.lifespan, this.yPoint * this.lifespan);
    pop();
  }

  updateLifespan() {
    if (this.lifespan > 0) {
      this.lifespan -= this.lifeReduction;
    } else {
      this.lifespan = 0;
      this.isDone = true;
    }
  }

}