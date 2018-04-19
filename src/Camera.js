var Engine = Engine || {};

'use strict';

Engine.prototype.Camera = function(engine, properties) {
  var engine = engine;
  
  var camera = function(){
    var that = this;
    var defaultProperties = {
       fov: {val: 90, step: 1, min: 0, max: 160, name: "Field Of View"},
       blending : true,
       SRC_ALPHA : {val: 1, step: 0.01, min: 0, max: 1, name: "Alpha blending"},
       MODE : { val: 4, 
                list:{ 
                  "POINTS": 0, 
                  "LINE_STRIP": 1, 
                  "LINE_LOOP": 2, 
                  "LINES": 3, 
                  "TRIANGLE_STRIP": 4, 
                  "TRIANGLE_FAN": 5, 
                  "TRIANGLES": 6
                }, 
                name: "Field Of View"},
       useTextureAtlas : true,
       useTerrain : false,
       stereoscopicMode : false,
       stereo_Separation : {val: 2, step: 0.01, min: 0, max: 5, name: "Stereo Separation"},
       stereo_Convergence : {val: 0, step: 0.001, min: 0, max: 1, name: "Stereo Convergence"},
       terrainCoefficient : {val: 1.0, step: 1, min: 0, max: 50, name: "Terrain Coefficient"},
       // bgColor : [ 135, 204, 250, 1.0 ]
       bgColor : [ 0, 0, 0, 1.0 ]
    };
    that.controls = new engine.objectControl("Camera", defaultProperties, true);
    for (var i in properties){
      if (properties[i] != that[i])
        that[i] = properties[i];
    }
    engine.controlManager.bindCameraControls(that);
    that.controls.setPosition({x: -0.5, y: 1.5, z: -16, tilt: -48, heading: 225, roll: 0});
    that.zNear = 0.1;
    that.zFar = 1000;
    that.hitTest = false;
    return that;
  };
  
  
  camera.prototype.degToRad = function(degres){
    return (degres * Math.PI/180);
  };
  
  camera.prototype.radToDeg = function(radinans){
    return (radinans * 180 / Math.PI);
  };
  
  camera.prototype.set = function (property, value) { 
    var that = this;
    var self = that.controls.position;
    var axis;
    if (property == "tilt")
      axis = "y";
    if (property == "roll")
      axis = "x";
      
    if (self.hitTest && axis){
      var offsetAngle = Math.atan(self.position.z * Math.cos(self[property]) / self.position[axis]);
      var realZ = Math.cos(self.degToRad(self[property] + value));
      var zValue = self.position.z * realZ / Math.cos(offsetAngle) + self.position[axis];
      if (zValue < 0 && self[property] + value < 0) 
        self[property] += value;
    } else
      self[property] += value;
      
    self[property] %= 360; 
  };
  
  camera.prototype.setZ = function (value) { 
    var that = this;
    var self = that.controls;
    var delta = Math.log(Math.abs(self.position.z));
    if (self.hitTest){
      if (self.position.z + value < 0) 
        self.position.z += value * ((delta >= 1) ? delta : 1 );
    }
    else
      self.position.z += value * ((delta >= 1) ? delta : 1 );
  };
  
  camera.prototype.setPosition = function (position, value) { 
    var that = this;
    var self = that.controls;
    var rotation;
    if (position == "x")
      rotation = "roll";
    if (position == "y")
      rotation = "tilt";
    if (self.hitTest && position){
      var cos = Math.cos(self.degToRad(self[rotation]));
      var z = self.position.z * cos;
      if (z + Math.abs(10 * value + self.position[position]) < 0) 
        self.position[position] += value * Math.log(Math.abs(self.position[position]));
    }
    else {
      var delta = Math.log(Math.abs(self.position[position]));
      self.position[position] += value * ((delta >= 1) ? delta : 1 );
    }
  };
  
  camera.prototype.getFieldOfView = function () { 
    var that = this;
    return that.controls.properties.fov.val;
  };
  
  camera.prototype.getAttribute = function(attrName) { 
    var that = this;
    var value;
    if (that.controls.properties[attrName] !== undefined){
      if (that.controls.properties[attrName].val !== undefined)
        value = that.controls.properties[attrName].val;
      else  
        value = that.controls.properties[attrName];
    } else if (that.controls.position[attrName] !== undefined){
      if(that.controls.position[attrName].val !== undefined)
        value = that.controls.position[attrName].val;
      else  
        value = that.controls.position[attrName];
    } else if (that.controls[attrName] !== undefined){
      if(that.controls[attrName].val !== undefined)
        value = that.controls[attrName].val;
      else  
        value = that.controls[attrName];
    } else if (that[attrName] !== undefined){
      if(that[attrName].val !== undefined)
        value = that[attrName].val;
      else  
        value = that[attrName];
    }
    return value;
  };
  
  camera.prototype.getCamJSON = function(){
    return JSON.stringify(that.controls);
  }
  
  return new camera();
};