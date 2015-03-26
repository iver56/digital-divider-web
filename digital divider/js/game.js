(function () {
    "use strict";

    // Initialize and Start the game
    document.addEventListener("DOMContentLoaded", initialize, false);
    var ORIGINAL_RES_X = 1600;
    var ORIGINAL_RES_Y = 960;

    var scaleW, scaleH;
    
    if (window.innerWidth < window.innerHeight) {
        scaleW = window.innerHeight / ORIGINAL_RES_X;
        scaleH = window.innerWidth / ORIGINAL_RES_Y;
    }
    else {
        scaleW = window.innerWidth / ORIGINAL_RES_X;
        scaleH = window.innerHeight / ORIGINAL_RES_Y;
    }

    window.addEventListener("resize", checkRotation, false);


    var preload;
    var canvas, context, stage;

    var gameStates = {
        menu: 0,
        inGame: 1,
        credits: 2,
        highscore: 3,
        tutorial1: 4,
        tutorial2: 5,
        tutorial3: 6,
        tutorial4: 7,
        tutorial5: 8,
        gameOver: 9,
        notPrepared: 10
    };
    var gameState = gameStates.notPrepared;
    var waiting4UserInput = false;

    //Backgrounds
    var menuBgImage, menuBgBitmap;
    var gameBgImage, gameBgBitmap;
    var highScoresBgImage, highScoresBgBitmap;
    var creditsBgImage, creditsBgBitmap;
    var tutorial1BgImage, tutorial1BgBitmap;
    var tutorial2BgImage, tutorial2BgBitmap;
    var tutorial3BgImage, tutorial3BgBitmap;
    var tutorial4BgImage, tutorial4BgBitmap;
    var tutorial5BgImage, tutorial5BgBitmap;
    var gameOverBgImage, gameOverBgBitmap;
    
    //Trails inGame
    var trailTopImage, trailMiddleImage, trailBottomImage;
    var trailBottomBitmap1;
    var trailMiddleBitmap1;
    var trailTopBitmap1;
    var trailBottomBitmap2;
    var trailMiddleBitmap2;
    var trailTopBitmap2;
    var trailBottom, trailMiddle, trailTop;

    //Fields
    var field2Image, field2Bitmap;
    var field3Image, field3Bitmap;
    var field5Image, field5Bitmap;
    var field7Image, field7Bitmap;
    var fieldOtherImage, fieldOtherBitmap;
    var fieldRedImage, fieldRedBitmap;
    var field2, field3, field5, field7, fieldOther, fieldRed;

    //Twirls
    var twirlImages = [];
    var twirlBitmaps = [];

    //Explosion
    var explosionImage, explosionBitmapAnimation;
    var explosionSpriteSheet;

    //Labels
    var scoreText;
    var gameOverScoreText;
    var highscorePositionsText;
    var highscoreNamesText;
    var highscoresText;

    //Game variables
    var speed;
    var numbers = [];
    var numberBeingDragged = null;
    var targetScore;
    var scoreCounter;
    var pointerX, pointerY;
    var highscores = [];
    var name = "";

    //Time variables
    var lastNumber;
    var gameStart;
    var timeBetweenNumbers; //timespan in milliseconds

    function Trail(positionY, speedMultiplier, trailBitmap1, trailBitmap2) {
        this.trailBitmap1 = trailBitmap1;
        this.trailBitmap2 = trailBitmap2;
        this.positionY = positionY;
        this.trailBitmap1.y = this.positionY;
        this.trailBitmap1.x = 0;
        this.trailBitmap2.y = this.positionY;
        this.trailBitmap2.x = -window.innerWidth;
        this.speedMultiplier = speedMultiplier;

        this.update = function (speed, timeElapsed) {
            if (this.trailBitmap1.x >= ORIGINAL_RES_X * scaleW)
                this.trailBitmap1.x = this.trailBitmap2.x - ORIGINAL_RES_X * scaleW;
            if (this.trailBitmap2.x >= ORIGINAL_RES_X * scaleW)
                this.trailBitmap2.x = this.trailBitmap1.x - ORIGINAL_RES_X * scaleW;
            this.trailBitmap1.x += speed * this.speedMultiplier * scaleW * timeElapsed * 0.03;
            this.trailBitmap2.x += speed * this.speedMultiplier * scaleW * timeElapsed * 0.03;
        }
    }

    function Field(positionX, positionY, fieldBitmap, value) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.fieldBitmap = fieldBitmap;
        this.fieldBitmap.x = this.positionX;
        this.fieldBitmap.y = this.positionY;
        this.fieldBitmap.rotation = 0;
        this.value = value;

        if (this.value != null) {
            this.text = new createjs.Text(this.value.toString(), Math.round(80 * scaleH).toString() + "px segoe ui", "white");
            this.text.scaleX = scaleW;
            this.text.scaleY = scaleH;
            this.text.x = this.positionX - 15 * scaleW;
            this.text.y = this.positionY - 45 * scaleH;
            this.text.visible = false;
        }

        this.update = function (speed, timeElapsed) {
            this.fieldBitmap.rotation = (this.fieldBitmap.rotation > 360 ? this.fieldBitmap.rotation + speed * 0.573 * timeElapsed * 0.03 - 360 : this.fieldBitmap.rotation + speed * 0.573 * timeElapsed * 0.03);
        }
    }

    function Number(bitmap1, bitmap2) {
        this.createdTime = new Date();
        this.positionX = -90 * scaleW;
        this.positionY = randomFromInterval(Math.round(390 * scaleH), Math.round(570 * scaleH));
        this.value = randomFromInterval(1, Math.floor(9 * Math.pow(1.5, speed)));
        this.goesToDestination = false;
        this.snapToTouchPoint = false;
        this.dropTime = null;
        this.destinationX = null;
        this.destinationY = null;

        if (this.value < 10) {
            this.textSize = 50;
        }
        else if (this.value < 100) {
            this.textSize = 40;
        }
        else {
            this.textSize = 32;
        }

        this.text = new createjs.Text(this.value.toString(), Math.round(this.textSize * scaleH).toString() + "px segoe ui", "white");
        this.text.scaleX = scaleW;
        this.text.scaleY = scaleH;
        this.text.regX = this.text.getMeasuredWidth() * 0.5 * scaleW;
        this.text.regY = this.text.getMeasuredHeight() * 0.5 * scaleH;
        this.text.x = this.positionX;
        this.text.y = this.positionY;

        this.bitmap1 = bitmap1;
        this.bitmap1.scaleX = scaleH;
        this.bitmap1.scaleY = scaleH;
        this.bitmap1.regX = 90;
        this.bitmap1.regY = 90;
        this.bitmap1.x = this.positionX;
        this.bitmap1.y = this.positionY;
        this.bitmap1.rotation = 0;
        
        this.bitmap2 = bitmap2;
        this.bitmap2.scaleX = scaleH;
        this.bitmap2.scaleY = scaleH;
        this.bitmap2.regX = 90;
        this.bitmap2.regY = 90;
        this.bitmap2.x = this.positionX;
        this.bitmap2.y = this.positionY;
        this.bitmap2.rotation = 0;

        this.update = function (speed, timeElapsed) {
            this.bitmap1.rotation += 2.8648 * timeElapsed * 0.03;
            if (this.bitmap1.rotation > 360) {
                this.bitmap1.rotation -= 360;
            }
            this.bitmap2.rotation -= 1.1459 * timeElapsed * 0.03;
            if (this.bitmap2.rotation < 0) {
                this.bitmap2.rotation += 360;
            }
            var fifty_percent = 1 - Math.pow(0.5, timeElapsed * 0.03);

            if (this.goesToDestination) {
                this.positionX += fifty_percent * (this.destinationX - this.positionX) * 0.6;
                this.positionY += fifty_percent * (this.destinationY - this.positionY) * 0.6;
                var ninety_percent = Math.pow(0.9, timeElapsed * 0.03);
                this.bitmap1.scaleX *= ninety_percent;
                this.bitmap1.scaleY *= ninety_percent;
                this.bitmap2.scaleX *= ninety_percent;
                this.bitmap2.scaleY *= ninety_percent;
                this.text.scaleX *= ninety_percent;
                this.text.scaleY *= ninety_percent;
            }
            else {
                if (numberBeingDragged != this) {
                    this.positionX += speed * timeElapsed * 0.03 * scaleW;
                }
                else {
                    var dX = pointerX - this.positionX;
                    var dY = pointerY - this.positionY;
                    var distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
                    this.positionX += (this.snapToTouchPoint ? 1 : fifty_percent) * dX;
                    this.positionY += (this.snapToTouchPoint ? 1 : fifty_percent) * dY;
                    if (distance < 90 * scaleW && !this.snapToTouchPoint) {
                        this.snapToTouchPoint = true;
                    }
                }
            }

            this.bitmap1.x = this.positionX;
            this.bitmap1.y = this.positionY;
            this.bitmap2.x = this.positionX;
            this.bitmap2.y = this.positionY;
            this.text.x = this.positionX;
            this.text.y = this.positionY;
        };

        this.setDestinationField = function (destinationX, destinationY) {
            this.destinationX = destinationX;
            this.destinationY = destinationY;
        }
    }

    function Explosion(positionX, positionY, explosionSpriteSheet) {
        this.animation = new createjs.BitmapAnimation(explosionSpriteSheet);
        this.animation.x = positionX;
        this.animation.y = positionY;
        this.animation.scaleX = 1.2 * scaleH;
        this.animation.scaleY = 1.2 * scaleH;

        this.animation.onAnimationEnd = function (instance, name) {
            stage.removeChild(instance);
            
        };
    }

    function Highscore(name, score, date) {
        this.name = name;
        this.score = score;
        this.date = date;
    }

    function newGame() {
        gameState = gameStates.inGame;
        gameBgBitmap.visible = true;
        trailBottomBitmap1.visible = true;
        trailBottomBitmap2.visible = true;
        trailMiddleBitmap1.visible = true;
        trailMiddleBitmap2.visible = true;
        trailTopBitmap1.visible = true;
        trailTopBitmap2.visible = true;
        field2Bitmap.visible = true;
        field2.text.visible = true;
        field3Bitmap.visible = true;
        field3.text.visible = true;
        field5Bitmap.visible = true;
        field5.text.visible = true;
        field7Bitmap.visible = true;
        field7.text.visible = true;
        fieldOtherBitmap.visible = true;
        fieldRedBitmap.visible = true;
        scoreText.visible = true;
        targetScore = 0;
        scoreCounter = targetScore;
        speed = 1;
        lastNumber = new Date();
        gameStart = new Date();
        setTimeBetweenNumbers();
    }

    function setHighscores() {
        var addHighScore = false;
        if (highscores.length == 10) {
            if (scoreCounter > highscores[highscores.length - 1].score) {
                addHighScore = true;
            }
        }
        else {
            addHighScore = true;
        }

        if (addHighScore && !waiting4UserInput) {
            waiting4UserInput = true;
            scoreCounter = Math.round(scoreCounter);
            alertify.prompt("<h2>New highscore: " + scoreCounter.toString() + "</h2><br><h4>Write your name</h4>", function (e, str) {
                if (e) {
                    $.jStorage.set("name", str);
                    name = str;
                    waiting4UserInput = false;
                    var now = new Date();
                    highscores.push(new Highscore(str, scoreCounter, now));
                    highscores.sort(function (a, b) { return b.score - a.score; });

                    if (highscores.length > 10) {
                        highscores.pop();
                    }
                    $.jStorage.set("highscores", highscores);
                }
                else {
                    //user clicks cancel
                    waiting4UserInput = false;
                }
            });
            $("#aText").val(name);
        }
    }

    function gameOver() {
        setHighscores();
        gameState = gameStates.gameOver;
        //show ads

        gameOverBgBitmap.visible = true;

        for (var i = 0; i < numbers.length; i++) {
            stage.removeChild(numbers[i].bitmap1);
            stage.removeChild(numbers[i].bitmap2);
            stage.removeChild(numbers[i].text);
        }

        numbers = [];
        numberBeingDragged = null;
        //vibrate

        gameBgBitmap.visible = false;
        trailBottomBitmap1.visible = false;
        trailBottomBitmap2.visible = false;
        trailMiddleBitmap1.visible = false;
        trailMiddleBitmap2.visible = false;
        trailTopBitmap1.visible = false;
        trailTopBitmap2.visible = false;
        field2Bitmap.visible = false;
        field2.text.visible = false;
        field3Bitmap.visible = false;
        field3.text.visible = false;
        field5Bitmap.visible = false;
        field5.text.visible = false;
        field7Bitmap.visible = false;
        field7.text.visible = false;
        fieldOtherBitmap.visible = false;
        fieldRedBitmap.visible = false;
        scoreText.visible = false;

        gameOverScoreText.text = (0 | scoreCounter).toString();
        gameOverScoreText.visible = true;

    }

    function updateSpeed() {
        var now = new Date();
        if (scoreCounter < 100) {
            speed = 1;
        }
        else {
            speed = Math.pow(0.21747241 * Math.log(scoreCounter), 2) + (now - gameStart) * 0.00001;
        }
    }

    function setTimeBetweenNumbers() {
        timeBetweenNumbers = randomFromInterval(Math.round(500 + 1500 / (speed * 0.5)), Math.round(700 + 6000 / (speed * 0.7)));
    }

    function randomFromInterval(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    function distanceToNumberCenter(fromX, fromY, toX, toY) {
        return Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    }

    function sendNumberToField() {
        numberBeingDragged.goesToDestination = true;
        numberBeingDragged.dropTime = new Date();
        var destinationFieldValue;
        if (numberBeingDragged.positionY > 390 * scaleH) {
            if (numberBeingDragged.positionX > 980 * scaleW) {
                destinationFieldValue = 10;
                numberBeingDragged.setDestinationField(1300 * scaleW, 810 * scaleH);
            }
            else if (numberBeingDragged.positionX > 460 * scaleW) {
                destinationFieldValue = 7;
                numberBeingDragged.setDestinationField(800 * scaleW, 810 * scaleH);
            }
            else {
                destinationFieldValue = 5;
                numberBeingDragged.setDestinationField(300 * scaleW, 810 * scaleH);
            }
        }
        else {
            if (numberBeingDragged.positionX > 710 * scaleW) {
                destinationFieldValue = 3;
                numberBeingDragged.setDestinationField(1070 * scaleW, 150 * scaleH);
            }
            else {
                destinationFieldValue = 2;
                numberBeingDragged.setDestinationField(530 * scaleW, 150 * scaleH);
            }
        }

        var numberValue = numberBeingDragged.value;
        numberBeingDragged = null;

        if (destinationFieldValue === 2 && numberValue % 2 === 0
            || destinationFieldValue === 3 && numberValue % 3 === 0
            || destinationFieldValue === 5 && numberValue % 5 === 0
            || destinationFieldValue === 7 && numberValue % 7 === 0) {
            targetScore += 2.5 * destinationFieldValue * speed * Math.log(0.6 * numberValue) + 0.02 * numberValue;
        }
        else if (destinationFieldValue === 10) {
            if (numberValue % 2 === 0
                || numberValue % 3 === 0
                || numberValue % 5 === 0
                || numberValue % 7 === 0) {
                initGameOver(250);
            }
            else {
                targetScore += 25 * speed * Math.log(0.6 * (numberValue < 2 ? 2 : numberValue)) + 0.02 * numberValue;
            }
        }
        else {
            initGameOver(250);
        }
    }

    function initGameOver(timeToGameOver) {
        setTimeout(gameOver, timeToGameOver);
    }

    function pointerUp(event) {
        if (!waiting4UserInput) {

            pointerX = event.x;
            pointerY = event.y;

            var scaledPointerX = event.x / scaleW;
            var scaledPointerY = event.y / scaleH;

            if (gameState === gameStates.menu) {
                if (scaledPointerX > 130) {
                    if (scaledPointerX > 1300 && scaledPointerY > 660) {
                        //sound on/off
                    }
                    else if (scaledPointerX < 610 && scaledPointerY > 260 && scaledPointerY < 412) {
                        newGame();
                        menuBgBitmap.visible = false;
                    }
                    else if (scaledPointerX < 650 && scaledPointerY >= 412 && scaledPointerY < 530) {
                        gameState = gameStates.tutorial1;
                        tutorial1BgBitmap.visible = true;
                        menuBgBitmap.visible = false;

                    }
                    else if (scaledPointerX < 710 && scaledPointerY >= 530 && scaledPointerY < 668) {
                        gameState = gameStates.highscore;
                        highScoresBgBitmap.visible = true;
                        highscorePositionsText.text = "";
                        highscoreNamesText.text = "";
                        highscoresText.text = "";
                        for (var i = 0; i < highscores.length; i++) {
                            highscorePositionsText.text += (i + 1).toString() + ".\n";
                            highscoreNamesText.text += highscores[i].name + "\n";
                            highscoresText.text += highscores[i].score.toString() + "\n";
                        }
                        highscorePositionsText.visible = true;
                        highscoresText.visible = true;
                        highscoreNamesText.visible = true;
                        menuBgBitmap.visible = false;
                    }
                    else if (scaledPointerX < 560 && scaledPointerY >= 668 && scaledPointerY < 800) {
                        gameState = gameStates.credits;
                        creditsBgBitmap.visible = true;
                        menuBgBitmap.visible = false;
                    }
                }
            }
            else if (gameState === gameStates.inGame) {
                if (numberBeingDragged != null) {
                    if (numberBeingDragged.positionY < 390 * scaleH || numberBeingDragged.positionY > 570 * scaleH) {
                        sendNumberToField();
                    }
                    else {
                        numberBeingDragged.snapToTouchPoint = false;
                        numberBeingDragged = null;
                    }
                }
            }
            else if (gameState === gameStates.gameOver) {
                gameOverBgBitmap.visible = false;
                gameOverScoreText.visible = false;

                if (scaledPointerX < 360 && scaledPointerY < 180) {
                    gameState = gameStates.menu;
                    menuBgBitmap.visible = true;
                }
                else {
                    newGame();
                }
            }
            else if (gameState === gameStates.credits) {
                gameState = gameStates.menu;
                menuBgBitmap.visible = true;
                creditsBgBitmap.visible = false;
            }
            else if (gameState === gameStates.highscore) {
                gameState = gameStates.menu;
                menuBgBitmap.visible = true;
                highscorePositionsText.visible = false;
                highscoreNamesText.visible = false;
                highscoresText.visible = false;
                highScoresBgBitmap.visible = false;
            }
            else if (gameState === gameStates.tutorial1) {
                gameState = gameStates.tutorial2;
                tutorial2BgBitmap.visible = true;
                tutorial1BgBitmap.visible = false;
            }
            else if (gameState === gameStates.tutorial2) {
                gameState = gameStates.tutorial3;
                tutorial3BgBitmap.visible = true;
                tutorial2BgBitmap.visible = false;
            }
            else if (gameState === gameStates.tutorial3) {
                gameState = gameStates.tutorial4;
                tutorial4BgBitmap.visible = true;
                tutorial3BgBitmap.visible = false;
            }
            else if (gameState === gameStates.tutorial4) {
                gameState = gameStates.tutorial5;
                tutorial5BgBitmap.visible = true;
                tutorial4BgBitmap.visible = false;
            }
            else if (gameState === gameStates.tutorial5) {
                gameState = gameStates.menu;
                menuBgBitmap.visible = true;
                tutorial5BgBitmap.visible = false;
            }
        }
    }

    function pointerDown(event) {
        if (!waiting4UserInput) {

            pointerX = event.x;
            pointerY = event.y;

            if (gameState === gameStates.inGame) {
                if (numberBeingDragged == null && numbers.length > 0) {
                    var shortestDistance = distanceToNumberCenter(event.x, event.y, numbers[0].positionX, numbers[0].positionY);
                    numberBeingDragged = numbers[0];
                    for (var i = 1; i < numbers.length; i++) {
                        var distance = distanceToNumberCenter(event.x, event.y, numbers[i].positionX, numbers[i].positionY);
                        if (distance < shortestDistance) {
                            shortestDistance = distance;
                            numberBeingDragged = numbers[i];
                        }
                    }
                    if (numberBeingDragged.goesToDestination) {
                        numberBeingDragged = null;
                    }
                }
            }
        }
    }

    function pointerMove(event) {
        if (!waiting4UserInput) {

            pointerX = event.x;
            pointerY = event.y;
        }
    }

    function initialize() {
        var appData = Windows.Storage.ApplicationData.current;
        var roamingSettings = appData.roamingSettings;

        preload = new createjs.PreloadJS();
        preload.onComplete = checkRotation;
        var manifest = [
            { id: "menuBg", src: "images/GFX/menuBg.png" },
            { id: "gameBg", src: "images/GFX/gameBg.png" },
            { id: "highScoresBg", src: "images/GFX/highScoresBg.png" },
            { id: "creditsBg", src: "images/GFX/creditsBg.png" },
            { id: "tutorial1Bg", src: "images/GFX/tutorial1Bg.png" },
            { id: "tutorial2Bg", src: "images/GFX/tutorial2Bg.png" },
            { id: "tutorial3Bg", src: "images/GFX/tutorial3Bg.png" },
            { id: "tutorial4Bg", src: "images/GFX/tutorial4Bg.png" },
            { id: "tutorial5Bg", src: "images/GFX/tutorial5Bg.png" },
            { id: "gameOverBg", src: "images/GFX/gameOverBg.png" },
            { id: "trailBottom", src: "images/GFX/trailBottom.png" },
            { id: "trailMiddle", src: "images/GFX/trailMiddle.png" },
            { id: "trailTop", src: "images/GFX/trailTop.png" },
            { id: "field2", src: "images/GFX/field2.png" },
            { id: "field3", src: "images/GFX/field3.png" },
            { id: "field5", src: "images/GFX/field5.png" },
            { id: "field7", src: "images/GFX/field7.png" },
            { id: "fieldOther", src: "images/GFX/fieldOther.png" },
            { id: "fieldRed", src: "images/GFX/fieldRed.png" },
            { id: "twirl0", src: "images/GFX/twirl0.png" },
            { id: "twirl1", src: "images/GFX/twirl1.png" },
            { id: "twirl2", src: "images/GFX/twirl2.png" },
            { id: "twirl3", src: "images/GFX/twirl3.png" },
            { id: "twirl4", src: "images/GFX/twirl4.png" },
            { id: "twirl5", src: "images/GFX/twirl5.png" },
            { id: "twirl6", src: "images/GFX/twirl6.png" },
            { id: "twirl7", src: "images/GFX/twirl7.png" },
            { id: "twirl8", src: "images/GFX/twirl8.png" },
            { id: "explosionSpriteSheet", src: "images/GFX/explosionSpriteSheet.png" },
        ];

        preload.loadManifest(manifest);
    }

    function checkRotation() {
        var viewStates = Windows.UI.ViewManagement.ApplicationViewState, msg;
        if (window.innerWidth < window.innerHeight || Windows.UI.ViewManagement.ApplicationView.value === viewStates.filled) {
            waiting4UserInput = true;
        }
        else {
            waiting4UserInput = false;
            if (gameState == gameStates.notPrepared) {
                gameState = gameStates.menu;
                prepareGame();
            }
        }
    }

    function prepareGame() {
        scaleW = window.innerWidth / ORIGINAL_RES_X;
        scaleH = window.innerHeight / ORIGINAL_RES_Y;

        canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context = canvas.getContext("2d");

        stage = new createjs.Stage(canvas);

        canvas.addEventListener("MSPointerUp", pointerUp, false);
        canvas.addEventListener("MSPointerMove", pointerMove, false);
        canvas.addEventListener("MSPointerDown", pointerDown, false);
        /*
        var canv = document.createElement('canvas');
        canv.id = 'canvas';
        document.getElementById('gameArea').appendChild(canv);*/
        /*
        $("#canvas").width(window.innerWidth);
        $("#canvas").height(window.innerHeight);
        $("#gameArea").width(window.innerWidth);
        $("#gameArea").height(window.innerHeight);
        */

        menuBgImage = preload.getResult("menuBg").result;
        menuBgBitmap = new createjs.Bitmap(menuBgImage);
        menuBgBitmap.scaleX = scaleW;
        menuBgBitmap.scaleY = scaleH;
        stage.addChild(menuBgBitmap);

        gameBgImage = preload.getResult("gameBg").result;
        gameBgBitmap = new createjs.Bitmap(gameBgImage);
        gameBgBitmap.scaleX = scaleW;
        gameBgBitmap.scaleY = scaleH;
        gameBgBitmap.visible = false;
        stage.addChild(gameBgBitmap);

        highScoresBgImage = preload.getResult("highScoresBg").result;
        highScoresBgBitmap = new createjs.Bitmap(highScoresBgImage);
        highScoresBgBitmap.scaleX = scaleW;
        highScoresBgBitmap.scaleY = scaleH;
        highScoresBgBitmap.visible = false;
        stage.addChild(highScoresBgBitmap);

        creditsBgImage = preload.getResult("creditsBg").result;
        creditsBgBitmap = new createjs.Bitmap(creditsBgImage);
        creditsBgBitmap.scaleX = scaleW;
        creditsBgBitmap.scaleY = scaleH;
        creditsBgBitmap.visible = false;
        stage.addChild(creditsBgBitmap);

        tutorial1BgImage = preload.getResult("tutorial1Bg").result;
        tutorial1BgBitmap = new createjs.Bitmap(tutorial1BgImage);
        tutorial1BgBitmap.scaleX = scaleW;
        tutorial1BgBitmap.scaleY = scaleH;
        tutorial1BgBitmap.visible = false;
        stage.addChild(tutorial1BgBitmap);

        tutorial2BgImage = preload.getResult("tutorial2Bg").result;
        tutorial2BgBitmap = new createjs.Bitmap(tutorial2BgImage);
        tutorial2BgBitmap.scaleX = scaleW;
        tutorial2BgBitmap.scaleY = scaleH;
        tutorial2BgBitmap.visible = false;
        stage.addChild(tutorial2BgBitmap);

        tutorial3BgImage = preload.getResult("tutorial3Bg").result;
        tutorial3BgBitmap = new createjs.Bitmap(tutorial3BgImage);
        tutorial3BgBitmap.scaleX = scaleW;
        tutorial3BgBitmap.scaleY = scaleH;
        tutorial3BgBitmap.visible = false;
        stage.addChild(tutorial3BgBitmap);

        tutorial4BgImage = preload.getResult("tutorial4Bg").result;
        tutorial4BgBitmap = new createjs.Bitmap(tutorial4BgImage);
        tutorial4BgBitmap.scaleX = scaleW;
        tutorial4BgBitmap.scaleY = scaleH;
        tutorial4BgBitmap.visible = false;
        stage.addChild(tutorial4BgBitmap);

        tutorial5BgImage = preload.getResult("tutorial5Bg").result;
        tutorial5BgBitmap = new createjs.Bitmap(tutorial5BgImage);
        tutorial5BgBitmap.scaleX = scaleW;
        tutorial5BgBitmap.scaleY = scaleH;
        tutorial5BgBitmap.visible = false;
        stage.addChild(tutorial5BgBitmap);

        gameOverBgImage = preload.getResult("gameOverBg").result;
        gameOverBgBitmap = new createjs.Bitmap(gameOverBgImage);
        gameOverBgBitmap.scaleX = scaleW;
        gameOverBgBitmap.scaleY = scaleH;
        gameOverBgBitmap.visible = false;
        stage.addChild(gameOverBgBitmap);


        trailBottomImage = preload.getResult("trailBottom").result;
        trailBottomBitmap1 = new createjs.Bitmap(trailBottomImage);
        trailBottomBitmap1.scaleX = scaleW;
        trailBottomBitmap1.scaleY = scaleH;
        trailBottomBitmap1.snapToPixel = true;
        trailBottomBitmap1.visible = false;
        stage.addChild(trailBottomBitmap1);

        trailMiddleImage = preload.getResult("trailMiddle").result;
        trailMiddleBitmap1 = new createjs.Bitmap(trailMiddleImage);
        trailMiddleBitmap1.scaleX = scaleW;
        trailMiddleBitmap1.scaleY = scaleH;
        trailMiddleBitmap1.snapToPixel = true;
        trailMiddleBitmap1.visible = false;
        stage.addChild(trailMiddleBitmap1);

        trailTopImage = preload.getResult("trailTop").result;
        trailTopBitmap1 = new createjs.Bitmap(trailTopImage);
        trailTopBitmap1.scaleX = scaleW;
        trailTopBitmap1.scaleY = scaleH;
        trailTopBitmap1.snapToPixel = true;
        trailTopBitmap1.visible = false;
        stage.addChild(trailTopBitmap1);

        trailBottomBitmap2 = new createjs.Bitmap(trailBottomImage);
        trailBottomBitmap2.scaleX = scaleW;
        trailBottomBitmap2.scaleY = scaleH;
        trailBottomBitmap2.snapToPixel = true;
        trailBottomBitmap2.visible = false;
        stage.addChild(trailBottomBitmap2);

        trailMiddleBitmap2 = new createjs.Bitmap(trailMiddleImage);
        trailMiddleBitmap2.scaleX = scaleH;
        trailMiddleBitmap2.scaleY = scaleH;
        trailMiddleBitmap2.snapToPixel = true;
        trailMiddleBitmap2.visible = false;
        stage.addChild(trailMiddleBitmap2);

        trailTopBitmap2 = new createjs.Bitmap(trailTopImage);
        trailTopBitmap2.scaleX = scaleH;
        trailTopBitmap2.scaleY = scaleH;
        trailTopBitmap2.snapToPixel = true;
        trailTopBitmap2.visible = false;
        stage.addChild(trailTopBitmap2);

        field2Image = preload.getResult("field2").result;
        field2Bitmap = new createjs.Bitmap(field2Image);
        field2Bitmap.scaleX = scaleH;
        field2Bitmap.scaleY = scaleH;
        field2Bitmap.regX = 150;
        field2Bitmap.regY = 150;
        field2Bitmap.visible = false;
        stage.addChild(field2Bitmap);

        field3Image = preload.getResult("field3").result;
        field3Bitmap = new createjs.Bitmap(field3Image);
        field3Bitmap.scaleX = scaleH;
        field3Bitmap.scaleY = scaleH;
        field3Bitmap.regX = 150;
        field3Bitmap.regY = 150;
        field3Bitmap.visible = false;
        stage.addChild(field3Bitmap);

        field5Image = preload.getResult("field5").result;
        field5Bitmap = new createjs.Bitmap(field5Image);
        field5Bitmap.scaleX = scaleH;
        field5Bitmap.scaleY = scaleH;
        field5Bitmap.regX = 150;
        field5Bitmap.regY = 150;
        field5Bitmap.visible = false;
        stage.addChild(field5Bitmap);

        field7Image = preload.getResult("field7").result;
        field7Bitmap = new createjs.Bitmap(field7Image);
        field7Bitmap.scaleX = scaleH;
        field7Bitmap.scaleY = scaleH;
        field7Bitmap.regX = 150;
        field7Bitmap.regY = 150;
        field7Bitmap.visible = false;
        stage.addChild(field7Bitmap);

        fieldOtherImage = preload.getResult("fieldOther").result;
        fieldOtherBitmap = new createjs.Bitmap(fieldOtherImage);
        fieldOtherBitmap.scaleX = scaleH;
        fieldOtherBitmap.scaleY = scaleH;
        fieldOtherBitmap.regX = 150;
        fieldOtherBitmap.regY = 150;
        fieldOtherBitmap.visible = false;
        stage.addChild(fieldOtherBitmap);

        fieldRedImage = preload.getResult("fieldRed").result;
        fieldRedBitmap = new createjs.Bitmap(fieldRedImage);
        fieldRedBitmap.scaleX = scaleH;
        fieldRedBitmap.scaleY = scaleH;
        fieldRedBitmap.regX = 150;
        fieldRedBitmap.regY = 150;
        fieldRedBitmap.visible = false;
        stage.addChild(fieldRedBitmap);

        explosionImage = preload.getResult("explosionSpriteSheet").result;
        explosionSpriteSheet = new createjs.SpriteSheet({
            images: [explosionImage],
            frames: { width: 250, height: 250, regX: 125, regY: 125 },
            animations: {
                explode: [0, 15, "explode", 3]
            }
        });


        for (var i = 0; i < 9; i++) {
            var twirlImage = preload.getResult("twirl" + i.toString()).result;
            twirlImages.push(twirlImage);
        }

        scoreText = new createjs.Text("Score: 0", Math.round(40 * scaleH).toString() + "px segoe ui", "white");
        scoreText.x = 20 * scaleW;
        scoreText.y = 10 * scaleH;
        scoreText.scaleX = scaleW;
        scoreText.scaleY = scaleH;
        scoreText.visible = false;
        stage.addChild(scoreText);

        gameOverScoreText = new createjs.Text("", Math.round(80 * scaleH).toString() + "px segoe ui", "white");
        gameOverScoreText.x = 730 * scaleW;
        gameOverScoreText.y = 420 * scaleH;
        gameOverScoreText.scaleX = scaleW;
        gameOverScoreText.scaleY = scaleH;
        gameOverScoreText.visible = false;
        stage.addChild(gameOverScoreText);

        highscorePositionsText = new createjs.Text("", Math.round(40 * scaleH).toString() + "px segoe ui", "white");
        highscorePositionsText.x = 180 * scaleW;
        highscorePositionsText.y = 220 * scaleH;
        highscorePositionsText.scaleX = scaleW;
        highscorePositionsText.scaleY = scaleH;
        highscorePositionsText.visible = false;
        stage.addChild(highscorePositionsText);

        highscoreNamesText = new createjs.Text("", Math.round(40 * scaleH).toString() + "px segoe ui", "white");
        highscoreNamesText.x = 290 * scaleW;
        highscoreNamesText.y = 220 * scaleH;
        highscoreNamesText.scaleX = scaleW;
        highscoreNamesText.scaleY = scaleH;
        highscoreNamesText.visible = false;
        stage.addChild(highscoreNamesText);

        highscoresText = new createjs.Text("", Math.round(40 * scaleH).toString() + "px segoe ui", "white");
        highscoresText.x = 1000 * scaleW;
        highscoresText.y = 220 * scaleH;
        highscoresText.scaleX = scaleW;
        highscoresText.scaleY = scaleH;
        highscoresText.visible = false;
        stage.addChild(highscoresText);

        highscores = $.jStorage.get("highscores", []);
        name = $.jStorage.get("name", "");

        trailBottom = new Trail(348 * scaleH, 0.33, trailBottomBitmap1, trailBottomBitmap2);
        trailMiddle = new Trail(284 * scaleH, 0.66, trailMiddleBitmap1, trailMiddleBitmap2);
        trailTop = new Trail(242 * scaleH, 1, trailTopBitmap1, trailTopBitmap2);

        field2 = new Field(534 * scaleW, 150 * scaleH, field2Bitmap, 2);
        stage.addChild(field2.text);
        field3 = new Field(1068 * scaleW, 150 * scaleH, field3Bitmap, 3);
        stage.addChild(field3.text);
        field5 = new Field(300 * scaleW, 810 * scaleH, field5Bitmap, 5);
        stage.addChild(field5.text);
        field7 = new Field(800 * scaleW, 810 * scaleH, field7Bitmap, 7);
        stage.addChild(field7.text);
        fieldOther = new Field(1300 * scaleW, 810 * scaleH, fieldOtherBitmap, null);
        fieldRed = new Field(1600 * scaleW, 480 * scaleH, fieldRedBitmap, null);

        stage.update();

        startGame();
    }

    function startGame() {
        createjs.Ticker.setInterval(window.requestAnimationFrame);
        createjs.Ticker.addListener(gameLoop);
    }

    function gameLoop(timeElapsed) {
        update(timeElapsed);
        draw();
    }

    function update(timeElapsed) {
        if (gameState === gameStates.inGame) {
            scoreCounter += 0.05 * (targetScore - scoreCounter) * timeElapsed * 0.03;

            var now = new Date();

            if (now - lastNumber > (numbers.length > 0 ? timeBetweenNumbers : timeBetweenNumbers * 0.01)) {
                setTimeBetweenNumbers();
                lastNumber = new Date();
                numbers.push(
                    new Number(
                        new createjs.Bitmap(twirlImages[randomFromInterval(4, 8)]),
                        new createjs.Bitmap(twirlImages[randomFromInterval(0, 3)])
                    ));
                stage.addChild(numbers[numbers.length - 1].bitmap1);
                stage.addChild(numbers[numbers.length - 1].bitmap2);
                stage.addChild(numbers[numbers.length - 1].text);
                targetScore += 9 * speed + 0.5 * Math.pow(Math.log(now - gameStart) * 0.4342945, 2);
            }

            var k = 0;
            while (k < numbers.length) {
                numbers[k].update(speed, timeElapsed);
                if (now - numbers[k].dropTime > 250 && numbers[k].goesToDestination) {
                    //TODO: initialize explosion
                    
                    var explosion = new Explosion(numbers[k].positionX, numbers[k].positionY, explosionSpriteSheet);
                    stage.addChild(explosion.animation);
                    explosion.animation.gotoAndPlay("explode");

                    stage.removeChild(numbers[k].bitmap1);
                    stage.removeChild(numbers[k].bitmap2);
                    stage.removeChild(numbers[k].text);
                    
                    numbers.splice(k, 1);
                }
                else {
                    if (distanceToNumberCenter(fieldRed.positionX, fieldRed.positionY, numbers[k].positionX, numbers[k].positionY) < 100 * scaleW && numberBeingDragged != numbers[k]) {
                        numbers[k].goesToDestination = true;
                        numbers[k].dropTime = now;
                        numbers[k].setDestinationField(fieldRed.positionX, fieldRed.positionY);
                        initGameOver(250);
                    }
                    k++;

                }
            }

            updateSpeed();

            trailBottom.update(speed, timeElapsed);
            trailMiddle.update(speed, timeElapsed);
            trailTop.update(speed, timeElapsed);
            field2.update(speed, timeElapsed);
            field3.update(speed, timeElapsed);
            field5.update(speed, timeElapsed);
            field7.update(speed, timeElapsed);
            fieldOther.update(speed, timeElapsed);
            fieldRed.update(speed, timeElapsed);

            scoreText.text = "Score: " + Math.round(scoreCounter).toString();
        }
    }

    function draw() {
        stage.update();
    }
})();
