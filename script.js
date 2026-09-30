let headerElement;
let uiControlsElement;

let windowWallCanvas;

let viewableCanvasHeight;
let fullCanvasHeight;

// My big curtains
let curtainRodImage;
let leftCurtainImage;
let rightCurtainImage;

let curtainState = "closed";

let openLeftCurtainXPos;
let openRightCurtainXPos;

let closedLeftCurtainXPos;
let closedRightCurtainXPos;

let curtainWidth;
let curtainHeight;
let visibleCurtainWidth;

let currentCurtainDrawingProcess = 1; // 0 = fully open, 1 = fully closed
let desiredCurtainDrawingProcess = 1;

let currentLeftCurtainXPos;
let currentRightCurtainXPos;

let drawCurtainsButton;

// Friends' Data
let friendsList = [];
let numOfFriends;

// Friends' Windows
let numOfCols;
let numOfRows;

let friendWindowWidth;
let friendWindowHeight;

let canvasPaddingX = 60;
let canvasPaddingY = 60;

let friendWindowMarginX = 30;
let friendWindowMarginY = 80;

let totalfriendWindowGridWidth;
let friendWindowGridStartXPos;

let breakpointWindowWidth = 800;

let friendWindowAspectRatio = 1;

// Temp
let friendWindowImageOpen;
let friendWindowImageClosed;

let currentTime;

let timeSegmentMorningImage;
let timeSegmentAfternoonImage;
let timeSegmentEveningImage;
let timeSegmentNightImage;

async function setup() {
  await getFriendsData();

  curtainRodImage = await loadImage("media/window_curtains_large/curtain_rod.png");
  leftCurtainImage = await loadImage("media/window_curtains_large/left_curtain.png");
  rightCurtainImage = await loadImage("media/window_curtains_large/right_curtain.png");

  timeSegmentMorningImage = await loadImage("media/time_segments/morning.jpg");
  timeSegmentAfternoonImage = await loadImage("media/time_segments/afternoon.jpg");
  timeSegmentEveningImage = await loadImage("media/time_segments/evening.jpg");
  timeSegmentNightImage = await loadImage("media/time_segments/night.jpg");

  headerElement = document.querySelector("#introduction-header");
  uiControlsElement = document.querySelector("#ui-controls-section");


  drawCurtainsButton = document.querySelector("#draw-curtains-button");

  drawCurtainsButton.addEventListener("click", function(event) {
    if (curtainState == "open") {
      curtainState = "closed";
      desiredCurtainDrawingProcess = 1;
    } else {
      curtainState = "open";
      desiredCurtainDrawingProcess = 0;
    }
  });

  // Temp
  friendWindowImageOpen = await loadImage("media/windows/open/open_window_1.png");
  friendWindowImageClosed = await loadImage("media/windows/closed/closed_window_1.png");

  // FIX
  numOfFriends = friendsList.length;

  viewableCanvasHeight = calculateViewableCanvasHeight();
  fullCanvasHeight = calculateFullCanvasHeight();
  
  curtainWidth = windowWidth/2;
  curtainHeight = viewableCanvasHeight;

  calculateCurtainPositions();

  windowWallCanvas = createCanvas(windowWidth, fullCanvasHeight);
  windowWallCanvas.parent("wall-of-windows-section");
}

function draw() {
  background(255);
  drawFriendWindows();
  drawCurtainsAnimation();
}

function windowResized() {
  viewableCanvasHeight = calculateViewableCanvasHeight();
  fullCanvasHeight = calculateFullCanvasHeight();

  curtainWidth = windowWidth/2;
  curtainHeight = viewableCanvasHeight;
  calculateCurtainPositions();

  resizeCanvas(windowWidth, fullCanvasHeight);
}

function calculateViewableCanvasHeight() {
  let currentlyViewableCanvasHeight = windowHeight - headerElement.offsetHeight - uiControlsElement.offsetHeight - 10;
  return currentlyViewableCanvasHeight;
}

function calculateFullCanvasHeight() {
  calculateGridSize();
  friendWindowDimensions();

  let newFullCanvasHeight = canvasPaddingY*2 + friendWindowHeight*numOfRows + friendWindowMarginY*(numOfRows - 1);

  if (newFullCanvasHeight < viewableCanvasHeight) {
    newFullCanvasHeight = viewableCanvasHeight;
  }

  return newFullCanvasHeight;
}

function showLeftCurtain() {
  currentLeftCurtainXPos = lerp(openLeftCurtainXPos, closedLeftCurtainXPos, currentCurtainDrawingProcess);
  image(leftCurtainImage, currentLeftCurtainXPos, 0, curtainWidth, fullCanvasHeight);
}

function showRightCurtain() {
  currentRightCurtainXPos = lerp(openRightCurtainXPos, closedRightCurtainXPos, currentCurtainDrawingProcess);
  image(rightCurtainImage, currentRightCurtainXPos, 0, curtainWidth, fullCanvasHeight);
}

function calculateCurtainPositions() {
  visibleCurtainWidth = 50;

  openLeftCurtainXPos = visibleCurtainWidth - curtainWidth;
  openRightCurtainXPos = windowWidth - visibleCurtainWidth;

  closedLeftCurtainXPos = 0;
  closedRightCurtainXPos = curtainWidth;
}

function drawCurtainsAnimation() {
  image(curtainRodImage, 0, 0, windowWidth, 50);
  currentCurtainDrawingProcess = lerp(currentCurtainDrawingProcess, desiredCurtainDrawingProcess, 0.1);
  showLeftCurtain();
  showRightCurtain();
}

function calculateGridSize() {
  if (windowWidth <= breakpointWindowWidth) {
    numOfCols = 1;
  } else {
    numOfCols = 2;
  }
  numOfRows = Math.ceil(numOfFriends/numOfCols);
}

function friendWindowDimensions() {
  friendWindowWidth = (windowWidth - canvasPaddingX*2 - friendWindowMarginX*(numOfCols-1))/numOfCols;
  

  // let maxFriendWindowHeight = viewableCanvasHeight - canvasPaddingY*2;
  // if (friendWindowHeight > maxFriendWindowHeight) {
  //   friendWindowHeight = maxFriendWindowHeight;
  //   friendWindowWidth = friendWindowHeight/friendWindowAspectRatio;
  // }

  // if (numOfCols == 1) {
  //   let maxFriendWindowWidth = windowWidth - visibleCurtainWidth*2 - canvasPaddingX*2;;
  // friendWindowGridStartXPos;
  //   if (friendWindowWidth > maxFriendWindowWidth) {
  //     friendWindowWidth = maxFriendWindowWidth;
  //   }
  // }
  
  friendWindowHeight = friendWindowWidth*friendWindowAspectRatio;
}

function drawFriendWindows() {
  calculateGridSize();
  friendWindowDimensions();
  getCurrentTime();

  for (let i=0; i<friendsList.length; i++) {
    let columnIndex = i%numOfCols;
    let rowIndex = Math.floor(i/numOfCols);

    let xPos = canvasPaddingX + friendWindowWidth*columnIndex + friendWindowMarginX*columnIndex;
    let yPos = canvasPaddingY + friendWindowHeight*rowIndex + friendWindowMarginY*rowIndex;

    let timeBackgroundImage = calculateFriendsTimeSegment(friendsList[i]["Timezone"]);
    // image(timeBackgroundImage, xPos, yPos, friendWindowWidth, friendWindowHeight);

    if (friendsList[i]["Available"] == "Yes") {
      image(timeBackgroundImage, xPos+20, yPos+20, friendWindowWidth*0.8, friendWindowHeight*0.8);
      image(friendWindowImageOpen, xPos, yPos, friendWindowWidth, friendWindowHeight);
    } else {
      image(friendWindowImageClosed, xPos, yPos, friendWindowWidth, friendWindowHeight);
    }
    
    drawWindowLabels(friendsList[i]["Name"], friendsList[i]["Location"], xPos, yPos+friendWindowHeight + friendWindowMarginY/3.5);
  }
}

function drawWindowLabels(name, loc, x, y) {
  textSize(20);
  textFont("Kalam");
  text(`${name}\n${loc}`, x, y);
} 

async function getFriendsData() {
  try{
    let response = await fetch("https://sheetdb.io/api/v1/otc69za7ccl17");
    console.log(response);
    if (!response.ok) {
      throw new Error("The response wasn't okay...");
    }

    friendsList = await response.json();
    console.log(friendsList);
  } catch(error) {
    alert("Could not retrieve data. Check console.");
    console.error("Something went wrong while trying to get the data from sheets db:", error);
  }
}

function getCurrentTime() {
  currentTime = new Date().getUTCHours();
}

function calculateFriendsTimeHour(timeOffset) {
  let friendsTime = currentTime + timeOffset;
  return friendsTime;
}

function calculateFriendsTimeSegment(timeOffset) {
  let friendsTime = (currentTime + Number(timeOffset))%24;
  if (friendsTime < 0) {
    friendsTime += 24;
  }
  let timeOfDayImage;
  if (friendsTime >= 0 && friendsTime < 5) {
    timeOfDayImage = timeSegmentNightImage;
  } else if (friendsTime >= 5 && friendsTime < 12) {
    timeOfDayImage = timeSegmentMorningImage;
  } else if (friendsTime >= 12 && friendsTime < 17) {
    timeOfDayImage = timeSegmentAfternoonImage;
  } else if (friendsTime >= 17 && friendsTime < 21) {
    timeOfDayImage = timeSegmentEveningImage;
  } else if (friendsTime >= 21 && friendsTime <= 24) {
    timeOfDayImage = timeSegmentNightImage;
  } 
  return timeOfDayImage;
}