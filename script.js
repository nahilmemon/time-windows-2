// ------------------------Overall Page Dimensions------------------------ //
// For determining the heights of all the elements on the page
let headerElement; // the introductory text section
let uiControlsElement; // where the draw curtains button is

let windowWallCanvas; // the p5 canvas where all the friends windows and large curtains are displayed

let fullCanvasHeight; // the full length of the p5 canvas
let viewableCanvasHeight; // the visible portion of the p5 cavnas on screen

// ------------------------Large Curtains for User------------------------ //
// For user's big curtains covering the whole screen
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

// To keep track of the position of each curtain on a scale of 0 to 1
// 0 = fully open, 1 = fully closed
let currentCurtainDrawingProgress = 1;
let desiredCurtainDrawingProgress = 1;

let currentLeftCurtainXPos;
let currentRightCurtainXPos;

let drawCurtainsButton; // button for toggling the main large curtains open or closed

// ------------------------Friends' Windows------------------------ //
// For storing friends' data
let friendsList = [];
let numOfFriends;

// For determining the grid size for the wall of friends' windows
let numOfCols;
let numOfRows;

// For determining the dimensions of each friends' window
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

// For the open/closed state of each friend's window
let friendWindowImageOpen;
let friendWindowImageClosed;

// ------------------------Time of Day Depictions------------------------ //
let currentTime;

let timeSegmentMorningImage;
let timeSegmentAfternoonImage;
let timeSegmentEveningImage;
let timeSegmentNightImage;

// ------------------------Setup Function------------------------ //
async function setup() {
  // Get data from SheetsDB about each friend
  await getFriendsData();

  // Load all the image assets
  curtainRodImage = await loadImage("media/window_curtains_large/curtain_rod.png");
  leftCurtainImage = await loadImage("media/window_curtains_large/left_curtain.png");
  rightCurtainImage = await loadImage("media/window_curtains_large/right_curtain.png");
  timeSegmentMorningImage = await loadImage("media/time_segments/morning.jpg");
  timeSegmentAfternoonImage = await loadImage("media/time_segments/afternoon.jpg");
  timeSegmentEveningImage = await loadImage("media/time_segments/evening.jpg");
  timeSegmentNightImage = await loadImage("media/time_segments/night.jpg");
  friendWindowImageOpen = await loadImage("media/windows/open/open_window_1.png");
  friendWindowImageClosed = await loadImage("media/windows/closed/closed_window_1.png");

  // Get all the document elements
  headerElement = document.querySelector("#introduction-header");
  uiControlsElement = document.querySelector("#ui-controls-section");
  drawCurtainsButton = document.querySelector("#draw-curtains-button");

  // When the user clicks on the draw curtains button, then toggle the open/closed state
  drawCurtainsButton.addEventListener("click", function(event) {
    if (curtainState == "open") {
      curtainState = "closed";
      desiredCurtainDrawingProgress = 1;
    } else {
      curtainState = "open";
      desiredCurtainDrawingProgress = 0;
    }
  });

  numOfFriends = friendsList.length;

  // Calculate the desired dimensions of the p5 canvas
  viewableCanvasHeight = calculateViewableCanvasHeight();
  fullCanvasHeight = calculateFullCanvasHeight();
  
  // Calculate the dimensions of the large curtains
  curtainWidth = windowWidth/2;
  curtainHeight = viewableCanvasHeight;

  // Determine the positions of each side of the large curtains
  calculateCurtainPositions();

  // Create and attach the p5 canvas
  windowWallCanvas = createCanvas(windowWidth, fullCanvasHeight);
  windowWallCanvas.parent("wall-of-windows-section");
}

// ------------------------Draw Loop------------------------ //
function draw() {
  background(255);
  // Draw each friend's window
  drawFriendWindows();
  // Draw the large curtains
  drawCurtainsAnimation();
}

// ------------------------Calculating Dimensions------------------------ //
// If the user resizes the window, then resize the size of the canvas and curtains
function windowResized() {
  // Recalculate the canvas size
  viewableCanvasHeight = calculateViewableCanvasHeight();
  fullCanvasHeight = calculateFullCanvasHeight();

  // Resize the curtains
  curtainWidth = windowWidth/2;
  curtainHeight = viewableCanvasHeight;
  calculateCurtainPositions();

  // Resize the canvas
  resizeCanvas(windowWidth, fullCanvasHeight);
}

// Calculate the viewable height of the canvas
function calculateViewableCanvasHeight() {
  // Take into consideration how much screen height is leftover when excluding
  // the heights of the header and draw curtains button
  let currentlyViewableCanvasHeight = windowHeight - headerElement.offsetHeight - uiControlsElement.offsetHeight - 10;
  return currentlyViewableCanvasHeight;
}

// Calculate how many rows and columns to use for drawing the friends' windows
function calculateGridSize() {
  // If the window width is too small, only show one column of windows
  if (windowWidth <= breakpointWindowWidth) {
    numOfCols = 1;
  } else {
    numOfCols = 2;
  }
  numOfRows = Math.ceil(numOfFriends/numOfCols);
}

// Calculate the dimensions for each friend's window
function friendWindowDimensions() {
  // Calculate the width by factoring in the padding for the canvas and the margin for each window
  friendWindowWidth = (windowWidth - canvasPaddingX*2 - friendWindowMarginX*(numOfCols-1))/numOfCols;
  // Calculate the height by using an aspect ratio based on the width
  friendWindowHeight = friendWindowWidth*friendWindowAspectRatio;
}

// Calculate the full height of the canvas
function calculateFullCanvasHeight() {
  // Calculate how many rows and columns to show
  calculateGridSize();
  // Calculate the dimensions of each friend's window
  friendWindowDimensions();

  // Figure out how tall to make the scrollable canvas depending on how many rows of friend windows there are
  let newFullCanvasHeight = canvasPaddingY*2 + friendWindowHeight*numOfRows + friendWindowMarginY*(numOfRows - 1);

  // If the needed full height for the canvas is shorter than the available visible area for the canvas
  // then just use the visible canvas height
  if (newFullCanvasHeight < viewableCanvasHeight) {
    newFullCanvasHeight = viewableCanvasHeight;
  }

  return newFullCanvasHeight;
}

// ------------------------Animating Large Curtains------------------------ //
// Draw the left curtain
function showLeftCurtain() {
  // On a scale of 0 (open) to 1 (closed), currentCurtainDrawingProgress 
  // determines the ratio of openness of the curtain
  // Lerp then smoothly helps map the new x position in pixels based on this progress ratio for a smooth animation
  currentLeftCurtainXPos = lerp(openLeftCurtainXPos, closedLeftCurtainXPos, currentCurtainDrawingProgress);
  // Show the left curtain image at the new x position
  image(leftCurtainImage, currentLeftCurtainXPos, 0, curtainWidth, fullCanvasHeight);
}

// Draw the right curtain
function showRightCurtain() {
  // On a scale of 0 (open) to 1 (closed), currentCurtainDrawingProgress 
  // determines the ratio of openness of the curtain
  // Lerp then smoothly helps map the new x position in pixels based on this progress ratio for a smooth animation
  currentRightCurtainXPos = lerp(openRightCurtainXPos, closedRightCurtainXPos, currentCurtainDrawingProgress);
  // Show the right curtain image at the new x position
  image(rightCurtainImage, currentRightCurtainXPos, 0, curtainWidth, fullCanvasHeight);
}

// Calculate the starting and ending curtain x positions for the open and closed states
function calculateCurtainPositions() {
  // Reset the visible width of the curtains
  visibleCurtainWidth = 50;
  
  // Calculate the starting x positions for each curtain 
  // The left curtain starts off screen
  openLeftCurtainXPos = visibleCurtainWidth - curtainWidth;
  // The right curtain stars on screen
  openRightCurtainXPos = windowWidth - visibleCurtainWidth;

  // Calculate the ending x positions for each curtain
  // The left curtain ends on screen
  closedLeftCurtainXPos = 0;
  // The right curtain ends off screen
  closedRightCurtainXPos = curtainWidth;
}

// Draw the curtains
function drawCurtainsAnimation() {
  // First show the curtain rod
  image(curtainRodImage, 0, 0, windowWidth, 50);
  // Using lerp to create a smoother transition, slowly move the curtain from the current to the desired position by 
  // calculating the ratio of how open the curtain should be
  currentCurtainDrawingProgress = lerp(currentCurtainDrawingProgress, desiredCurtainDrawingProgress, 0.1);
  // Show the left and right curtains
  showLeftCurtain();
  showRightCurtain();
}

// ------------------------Friends' Windows------------------------ //
// Retrieve the data for each friend using SheetsDB API
async function getFriendsData() {
  try{
    // Fetch the whole dataset
    let response = await fetch("https://sheetdb.io/api/v1/otc69za7ccl17");
    // Throw an error if something went wrong
    if (!response.ok) {
      throw new Error("The response wasn't okay...");
    }
    // Convert the response into json
    friendsList = await response.json();
  } catch(error) {
    // Show an alert and console error if something went wrong
    alert("Could not retrieve data. Check console.");
    console.error("Something went wrong while trying to get the data from sheets db:", error);
  }
}

// Get the current time's hours in UTC using 24-hour format
function getCurrentTime() {
  currentTime = new Date().getUTCHours();
}

// Figure out which image to show behind a given friend's window to represent the time of day
// timeOffset is the timezone offset from UTC in unit of hours
function calculateFriendsTimeSegment(timeOffset) {
  // Given a timezone offset in unit of hours, determine the given friend's time in hours (24-hr format)
  let friendsTime = (currentTime + Number(timeOffset))%24;
  // If friendsTime becomes a negative number, circle back 
  if (friendsTime < 0) {
    friendsTime += 24;
  }


  // To keep track of which background image to use
  let timeOfDayImage;
  // For now, determine which image to show by breaking down the day into four segments 
  // (morning, afternoon, evening, and night) arbitrarily
  // But for future updates, change the segmentation based on when sunrise and sunset are
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

// Draw a label for a given friend's window by depicting their name and location
function drawWindowLabels(name, loc, x, y) {
  textSize(20);
  textFont("Kalam");
  text(`${name}\n${loc}`, x, y);
} 

// Draw each friend's window
function drawFriendWindows() {
  // Calculate how many rows and columns to show
  calculateGridSize();
  // Calculate the dimension of each window
  friendWindowDimensions();

  // Get the current time
  getCurrentTime();

  // Draw a window for each friend
  for (let i=0; i<friendsList.length; i++) {
    // Determine where in the grid to show this friend's window by figuring out which row and column to draw it in
    let columnIndex = i%numOfCols;
    let rowIndex = Math.floor(i/numOfCols);

    // Calculate the x and y positions for this friend, taking into account the canvas' padding 
    // and the margin between the windows
    let xPos = canvasPaddingX + friendWindowWidth*columnIndex + friendWindowMarginX*columnIndex;
    let yPos = canvasPaddingY + friendWindowHeight*rowIndex + friendWindowMarginY*rowIndex;

    // Figure out which time of day background image to display behind the window based on this friend's current time in their timezone
    let timeBackgroundImage = calculateFriendsTimeSegment(friendsList[i]["Timezone"]);

    // If the friend is available, then show an open-curtained window with the time of day background image behind it
    // Otherwise, show closed curtains
    if (friendsList[i]["Available"] == "Yes") {
      image(timeBackgroundImage, xPos+friendWindowWidth*0.1, yPos+friendWindowHeight*0.05, friendWindowWidth*0.8, friendWindowHeight*0.8);
      image(friendWindowImageOpen, xPos, yPos, friendWindowWidth, friendWindowHeight);
    } else {
      image(friendWindowImageClosed, xPos, yPos, friendWindowWidth, friendWindowHeight);
    }
    
    // Annotate the window with this friend's name and location
    drawWindowLabels(friendsList[i]["Name"], friendsList[i]["Location"], xPos, yPos+friendWindowHeight + friendWindowMarginY/3.5);
  }
}