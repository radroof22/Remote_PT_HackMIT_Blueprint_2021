let video;
let poseNet;
let poses = [];

let mode = "hamstring_curl_left";
let flexion = true;

let reps = 0;
let angle = undefined

let workouts = {
  bicep_curls_left: {
    body_parts: [
      "leftWrist",
      "leftElbow",
      "leftShoulder"
    ],
    thresholds: {
      flexion:30, //60
      extension: 170 //140
    },
    angleConv: 3.05555556
  },
  bicep_curls_right: {
    body_parts: [
      "rightWrist",
      "rightElbow",
      "rightShoulder"
    ],
    thresholds: {
      flexion:30, //60
      extension: 170 //140
    },
    angleConv: 3.05555556
  },
  lateral_abduction_left: {
    body_parts: [
      "leftWrist",
      "leftShoulder",
      "leftHip",
    ],
    thresholds: {
      flexion: 30, //Good
      extension: 100 //90
    },
    angleConv: (290-40)/90
  },
  lateral_abduction_right: {
    body_parts: [
      "rightWrist",
      "rightShoulder",
      "rightHip",
    ],
    thresholds: {
      flexion: 30, //Good
      extension: 100 //90
    },
    angleConv: (290-40)/90
  },
  // hip_abduction_left: {
  //   body_parts: [
  //     "rightKnee",
  //     "leftHip",
  //     "leftKnee",
  //   ],
  //   thresholds: {
  //     flexion: 30,
  //     extension: 100
  //   },
  //   angleConv: 1
  // }
  lateral_raises_left: {
    body_parts: [
      "leftHip",
      "leftShoulder",
      "leftWrist",
    ],
    thresholds: {
      flexion: 20,
      extension: 90
    },
    angleConv: (300-30)/90
  },
  lateral_raises_right: {
    body_parts: [
      "rightHip",
      "rightShoulder",
      "rightWrist",
    ],
    thresholds: {
      flexion: 20,
      extension: 90
    },
    angleConv: (300-30)/90
  },

  wall_walking_right: {
    body_parts: [
      "leftWrist",
      "leftShoulder",
      "rightWrist",
    ],
    thresholds: {
      flexion: 150,
      extension: 200
    },
    angleConv: (300-84)/90
  },
  wall_walking_left: {
    body_parts: [
      "rightWrist",
      "rightShoulder",
      "leftWrist",
    ],
    thresholds: {
      flexion: 150,
      extension: 200
    },
    angleConv: (300-84)/90
  },
  /*lawn_mower_right: {
    body_parts: [
      "leftShoulder",
      "rightShoulder",
      "rightWrist",
    ],
    thresholds: {
      flexion: 50,
      extension: 200
    },
    angleConv: (550-60)/180
  },
  lawn_mower_right: {
    body_parts: [
      "rightShoulder",
      "leftShoulder",
      "leftWrist",
    ],
    thresholds: {
      flexion: 50,
      extension: 200
    },
    angleConv: (550-60)/180
  },*/

  forward_bend: {
    body_parts: [
      "leftKnee",
      "leftHip",
      "leftShoulder"
    ],
    thresholds: {
      flexion: 260, //Good
      extension: 280 //Good
    },
    angleConv: 1/((550-450)/180)
  },
  hip_extension_left: {
    body_parts: [
      "rightAnkle",
      "leftHip",
      "leftAnkle"
    ],
    thresholds: {
      flexion: 15,
      extension: 60
    },
    angleConv: 1
  },
  hip_extension_right: {
    body_parts: [
      "leftAnkle",
      "rightHip",
      "rightAnkle"
    ],
    thresholds: {
      flexion: 15,
      extension: 60
    },
    angleConv: 1
  },
  /*hamstring_curl_left: {
    body_parts: [
      "leftHip",
      "leftKnee",
      "leftAnkle"
    ],
    thresholds: {
      flexion: 170,
      extension: 190
    },
    angleConv: (510-470)/15
  }*/
  
  
}

var f =  0;

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('videoContainer');

  
  

  // Video capture
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  
  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  translate(640, 0)
  scale(-1,1)
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  var sideSwitch = document.getElementById("sidedNess");
  switch(window.location.pathname){
    case "/ankle.html": 
      console.log("ankle");
      break;
    case "/back.html":
      mode  = "forward_bend"
      break;
    case "/elbow.html":

      if(sideSwitch.checked){
        mode = "bicep_curls_right"
      }else{
        mode = "bicep_curls_left"
      }
      
      break;
    case "/hand.html":
      console.log("hand")
      break;
    case "/hip.html":
      if(sideSwitch.checked){
        mode = "hip_extension_right"
      }else{
        mode = "hip_extension_left"
      }
      
      break;
    case "/knee.html":
      console.log("Knee")
      break;
    case "/shoulder.html":
      if(sideSwitch.checked){
        mode = "lateral_raises_right"
      }else{
        mode = "lateral_abduction_left"
      }
      
      break;
    case "/wrist.html":
      if(sideSwitch.checked){
        mode = "wall_walking_right"
      }else{
        mode = "wall_walking_left"
      }
      
      break;
  }

  

  if(poses.length > 0){
    drawKeypoints();
    drawSkeleton();
    calculateAngleBicep()
  }

  if(f % 20 == 0 && angle != null){
    f = 0
    repTracker()
  }

}

function modelReady(){
  select('#status').html('model Loaded')
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  console.log(mode)
  let workout = workouts[mode]
  for(var p=0; p< workout["body_parts"].length;p++){
    keypoint =  poses[0].pose[workout["body_parts"][p]] 
    if (keypoint.confidence > .5){
      fill(255, 0, 0);
      noStroke();
      ellipse(keypoint.x, keypoint.y, 10, 10);
    }
  }
  // // Loop through all the poses detected
  // for (let i = 0; i < poses.length; i++) {
  //   // For each pose detected, loop through all the keypoints
  //   let pose = poses[i].pose;
  //   for (let j = 0; j < pose.keypoints.length; j++) {
  //     // A keypoint is an object describing a body part (like rightArm or leftShoulder)
  //     let keypoint = pose.keypoints[j];
  //     // Only draw an ellipse is the pose probability is bigger than 0.2
  //     if (keypoint.score > 0.5) {
  //       fill(255, 0, 0);
  //       noStroke();
  //       ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
  //     }
  //   }
  // }
}

// A function to draw the skeletons
function drawSkeleton() {
  // // Loop through all the skeletons detected
  // for (let i = 0; i < poses.length; i++) {
  //   let skeleton = poses[i].skeleton;
  //   // For every skeleton, loop through all body connections
  //   for (let j = 0; j < skeleton.length; j++) {
  //     let partA = skeleton[j][0];
  //     let partB = skeleton[j][1];
  //     stroke(255, 0, 0);
  //     line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  //   }
  // }
  let workout = workouts[mode]
  let parts = []
  for(var p=0; p< workout["body_parts"].length;p++){
    parts.push(poses[0].pose[workout["body_parts"][p]])
  }
  // Draw limb_01
  stroke(0, 255, 0)
  line(parts[0].x, parts[0].y, parts[1].x, parts[1].y)
  // Draw limb_12
  stroke(0, 255, 0)
  line(parts[1].x, parts[1].y, parts[2].x, parts[2].y)
}

function calculateAngleBicep(){
  // Left arm calculation
  let workout = workouts[mode]
  let parts = []
  for(var p=0; p< workout["body_parts"].length;p++){
    parts.push(poses[0].pose[workout["body_parts"][p]])
  }
  if (!(parts[0].confidence > .5 && parts[1].confidence > .5 && parts[2].confidence > .5 ))
      return null;
  let limb_01 = _calculateDistance(parts[0], parts[1]);
  let limb_12 = _calculateDistance(parts[1], parts[2]);
  let limb_02 = _calculateDistance(parts[0], parts[2]);

  angle = Math.round(_lawCosines(limb_01, limb_12, limb_02, workout["angleConv"]) * 100) / 100;
  console.log(angle)
}

function repTracker(){
  let workout = workouts[mode]
  
  let angleCountObj = document.getElementById("bottom-left-rectangle")
  angleCountObj.innerHTML = "Angle: " + angle.toString()
  
  let taskObj = document.getElementById("bottom-top-rectangle")
  if(flexion && angle < workout["thresholds"]["flexion"]){
    reps++;
    flexion = false;
    taskObj.innerHTML = "Task: " + "Extend your muscle"
  }else if(!flexion && angle > workout["thresholds"]["extension"]){
    flexion = true;
    taskObj.innerHTML = "Task: " + "Flex your muscle"
  }

  let repCountObj = document.getElementById("bottom-right-rectangle")
  repCountObj.innerHTML = "Reps: " + reps.toString()
}

function _calculateDistance(keypoint1, keypoint2){
  // calculate euclidian distance between keypoints
  return Math.sqrt((keypoint1.x - keypoint2.x)**2 + (keypoint1.y - keypoint2.y)**2);
}

function _lawCosines(a, b, c, angleConv){
  // solves for angle opposite side C
  return Math.acos((c**2 - a**2 - b**2)/(-2*a*b)) * 180 / angleConv; // returned as radians
}