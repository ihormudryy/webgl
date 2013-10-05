var engine = engine || {};

'use strict';

engine.prototype.PhysicManager = function (engine) {
  var physicsManager = {};
  var mat4 = engine.mat4;
  var vec3 = engine.vec3;
  var camera = engine.camera;
  physicsManager.vecX = [1,0,0];
  physicsManager.vecY = [0,1,0];
  physicsManager.vecZ = [0,0,1];
  physicsManager.moveInCameraSpace = [0,0,-25];
  physicsManager.moveInWorldSpace = [];
  physicsManager.rotateInCameraSpace = [-80,0,0];
  physicsManager.rotateInWorldSpace = [];
  physicsManager.speed = .1;
  physicsManager.acceleration = 0;
  physicsManager.bindCameraToObject = true;
  var objectSpaceMat = mat4.identity();
  var orientationMatrix = mat4.identity();
  var vecMoveMatrix = mat4.identity();
  
  function updateProperties() { 
    physicsManager.rotateInWorldSpace[0] = camera.tilt;
    physicsManager.rotateInWorldSpace[1] = camera.roll;
    physicsManager.rotateInWorldSpace[2] = camera.heading;
    physicsManager.moveInWorldSpace[0] = camera.pos.x;
    physicsManager.moveInWorldSpace[1] = camera.pos.y;
    physicsManager.moveInWorldSpace[2] = camera.pos.z;
  }
  
  physicsManager.getRight = function () { 
    var that = this;
    return [that.vecMoveMatrix[0], that.vecMoveMatrix[1], that.vecMoveMatrix[2]];
  }
  
  physicsManager.getUp = function () { 
    var that = this;
    return [that.vecMoveMatrix[4], that.vecMoveMatrix[5], that.vecMoveMatrix[6]];
  }
  
  physicsManager.getForward = function () { 
    var that = this;
    return [that.vecMoveMatrix[8], that.vecMoveMatrix[9], that.vecMoveMatrix[10]];
  }
  
  physicsManager.getPosition = function () { 
    var that = this;
    return [that.orientationMatrix[12], that.orientationMatrix[13], that.orientationMatrix[14]];
  }
  
  function objectSpace(timeStamp) { 
    var that = this;
   
    objectSpaceMat = orientationMatrix;
    var xAnglePlane = Math.PI * that.rotateInCameraSpace[0] / 180;
    var yAnglePlane = Math.PI * that.rotateInCameraSpace[1] / 180;
    var zAnglePlane = Math.PI * that.rotateInCameraSpace[2] / 180;
    
    mat4.translate(objectSpaceMat, that.moveInCameraSpace);
    
    mat4.rotate(objectSpaceMat, xAnglePlane, that.vecX);
    mat4.rotate(objectSpaceMat, yAnglePlane / 180, that.vecY);
    mat4.rotate(objectSpaceMat, zAnglePlane / 180, that.vecZ);
    /*
    var move = [];
    time *= .1;
    move[0] = -Math.sin(zAnglePlane) * that.speed * time;
    move[1] = Math.sin(xAnglePlane) * that.speed * time;
    move[2] = -Math.cos(zAnglePlane) * that.speed * time;
    mat4.translate(objectSpaceMat, move);
    mat4.rotate(objectSpaceMat, xAnglePlane - Math.PI * .5, that.vecX);
    mat4.rotate(objectSpaceMat, yAnglePlane, that.vecY);
    mat4.rotate(objectSpaceMat, zAnglePlane, that.vecZ);
    */
    return objectSpaceMat;
  };
  
  function vectorMat(angles){
    var cos = Math.cos;
    var sin = Math.sin;
    var a = angles[0];
    var b = angles[1];
    var t = angles[2];
    vecMoveMatrix[0] = cos(a)*cos(t) - sin(a)*cos(b)*sin(t);
    vecMoveMatrix[1] = -cos(a)*sin(t) - sin(a)*cos(b)*cos(t);
    vecMoveMatrix[2] = sin(a)*sin(b);
    vecMoveMatrix[4] = sin(a)*cos(t) + cos(a)*cos(b)*sin(t);
    vecMoveMatrix[5] = -sin(a)*sin(t) + cos(a)*cos(b)*cos(t);
    vecMoveMatrix[6] = -cos(a)*sin(b);
    vecMoveMatrix[8] = sin(b)*sin(t);
    vecMoveMatrix[9] = sin(b)*cos(t);
    vecMoveMatrix[10] = cos(b);
  };
  
  function cameraSpace(timeStamp) { 
    var that = this;
    var time = 0;
    if (!that.startTime){
      that.startTime = timeStamp.getTime();
    } else {
      time = timeStamp.getTime() - that.startTime;
    }
    updateProperties();

    orientationMatrix = mat4.identity();
    
    var xAngle = Math.PI * (that.rotateInWorldSpace[0])/ 180; 
    var yAngle = Math.PI * (that.rotateInWorldSpace[1])/ 180; 
    var zAngle = Math.PI * (that.rotateInWorldSpace[2])/ 180; 
    mat4.rotate(orientationMatrix, xAngle, [1, 0, 0]);
    mat4.rotate(orientationMatrix, yAngle, [0, 1, 0]);
    mat4.rotate(orientationMatrix, zAngle, [0, 0, 1]);
    if (that.bindCameraToObject){
      var move = [];
      time *= .1;
      move[0] = -Math.sin(zAngle) * that.speed * time;
      move[1] = -Math.cos(zAngle) * that.speed * time;
      move[2] = Math.cos(xAngle) * that.speed * time - 30;
      mat4.translate(orientationMatrix, move);
    }
    return orientationMatrix;
  };

  function freeSpace(time){
    var that = this;
    updateProperties();

    var _orientationMatrix = mat4.identity();
    
    mat4.translate(_orientationMatrix, [camera.pos.x, camera.pos.y, camera.pos.z]);
    var xAngle = Math.PI * (that.rotateInWorldSpace[0])/ 180; 
    var yAngle = Math.PI * (that.rotateInWorldSpace[1])/ 180; 
    var zAngle = Math.PI * (that.rotateInWorldSpace[2])/ 180; 
    mat4.rotate(_orientationMatrix, xAngle, [1, 0, 0]);
    mat4.rotate(_orientationMatrix, yAngle, [0, 1, 0]);
    mat4.rotate(_orientationMatrix, zAngle, [0, 0, 1]);
    
    return _orientationMatrix;
  }
  
  physicsManager.setGameMode = function(){
    this.mode = 'game';
    camera.tilt = -90;
    camera.roll = 0;
    camera.heading = 0;
    camera.pos.x = 0;
    camera.pos.y = 0;
    camera.pos.z = -100;
    this.objectSpace = objectSpace;
    this.cameraSpace = cameraSpace;
  }
  
  physicsManager.setFreeCameraMode = function(){
    this.mode = 'camera';
    this.objectSpace = freeSpace;
    this.cameraSpace = freeSpace;
  }
  
  physicsManager.roteteAroundPivot = function(speed){
    camera.heading += (speed) ? speed : 0.5;
    camera.heading %= 360;
  }
  
  physicsManager.animateTilt = function(){
    //camera.tilt = Math.asin(Math.cos(camera.tilt++));
  }
  return physicsManager;
};