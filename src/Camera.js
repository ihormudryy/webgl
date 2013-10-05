var engine = engine || {};

'use strict';

engine.prototype.Camera = function(properties) {
  var Camera = {};
  
  Camera.hitTest = false;
  Camera.factor = 64;
  Camera.fov = 80;
  Camera.zNear = 0.1;
  Camera.zFar = 100000;
  Camera.pos = {'x': 0, 'y': 0, 'z': -30};
  Camera.origin = {'origX': 0, 'origY': 0, 'origZ': 0};
  Camera.tilt = 280;
  Camera.roll =  0;
  Camera.heading = 33;
  Camera.blending = true;
  Camera.SRC_ALPHA = 5;
  Camera.useLighting = true;
  Camera.MODE = 4;
  Camera.showTextureMap = true;
  Camera.useSpecularMap = true;
  Camera.materialShininess = 32.0;
  Camera.ambientColor = [ 42, 42, 42 ];
  Camera.specularColor = [ 4, 8, 4 ];
  Camera.pointLightingDiffuse = [ 102, 91, 91 ];
  Camera.bgColor = [ 135, 204, 250, 1.0 ];
  Camera.lightDirection = {lightDirectionX: -10, lightDirectionY: 10, lightDirectionZ: -0.4};
  
  for (var i in properties){
    if (properties[i] != Camera[i])
      Camera[i] = properties[i];
  }
  
  Camera.degToRad = function(degres){
    return (degres * Math.PI/180);
  };
  
  Camera.radToDeg = function(radinans){
    return (radinans * 180 / Math.PI);
  };
  
  Camera.set = function (property, value) { 
    var self = this;
    var axis;
    if (property == "tilt")
      axis = "y";
    if (property == "roll")
      axis = "x";
      
    if (self.hitTest && axis){
      var offsetAngle = Math.atan(self.pos.z * Math.cos(self[property]) / self.pos[axis]);
      var realZ = Math.cos(self.degToRad(self[property] + value));
      var zValue = self.pos.z * realZ / Math.cos(offsetAngle) + self.pos[axis];
      if (zValue < 0 && self[property] + value < 0) 
        self[property] += value;
    } else
      self[property] += value;
      
    self[property] %= 360;
  };
  
  Camera.setZ = function (value) { 
    var self = this;
    var delta = Math.log(Math.abs(self.pos.z));
    if (self.hitTest){
      if (self.pos.z + value < 0) 
        self.pos.z += value * ((delta >= 1) ? delta : 1 );
    }
    else
      self.pos.z += value * ((delta >= 1) ? delta : 1 );
  };
  
  Camera.setPosition = function (position, value) { 
    var self = this;
    var rotation;
    if (position == "x")
      rotation = "roll";
    if (position == "y")
      rotation = "tilt";
    if (self.hitTest && position){
      var cos = Math.cos(self.degToRad(self[rotation]));
      var z = self.pos.z * cos;
      if (z + Math.abs(10 * value + self.pos[position]) < 0) 
        self.pos[position] += value * Math.log(Math.abs(self.pos[position]));
    }
    else {
      var delta = Math.log(Math.abs(self.pos[position]));
      self.pos[position] += value * ((delta >= 1) ? delta : 1 );
    }
  };

  return Camera;
};