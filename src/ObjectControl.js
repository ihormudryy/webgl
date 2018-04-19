var Engine = Engine || {};

'use strict';

Engine.prototype.ObjectControl = function(engine) {
  var engine = engine;
  var gui = engine.datGUI;
  
  var objectControl = function(name, properties, addGui, parent){
    var that = this;
    that.childNodes = [];
    that.position = {
      tilt: 0,
      roll: 0,
      heading: 0,
      x: 0,
      y: 0,
      z: 0
    };
    that.matModel = engine.mat4.identity();
    that.properties = properties;
     
    if (addGui) {
      var node = (parent) ? parent : gui;
      that.folder = node.addFolder(name, that.position, that.properties);
    }
  }
  
  objectControl.prototype.update = function(mvMat){
    var that = this;
   
    var worldSpace = (mvMat) ? mvMat : engine.mat4.identity();
    var matModel = engine.mat4.identity();
    
    var xAnglePlane = Math.PI * that.position.tilt / 180;
    var yAnglePlane = Math.PI * that.position.roll / 180;
    var zAnglePlane = Math.PI * that.position.heading / 180;
    
    engine.mat4.translate(matModel, [that.position.x, that.position.y, that.position.z]);
    
    engine.mat4.rotate(matModel, xAnglePlane, [1, 0, 0]);
    engine.mat4.rotate(matModel, yAnglePlane, [0, 1, 0]);
    engine.mat4.rotate(matModel, zAnglePlane, [0, 0, 1]);
    

    that.matModel = engine.mat4.multiply(worldSpace, matModel);
    
    for(var c in that.childNodes){
      that.childNodes[c].controls && that.childNodes[c].controls.update( that.matModel );
    }
    
    return that.matModel;
  }

  objectControl.prototype.setPosition = function( position ){
    var that = this;
    for (var i in position){
      that.position[i] = position[i];
    }
  }

  objectControl.prototype.getPosition = function( ){
    var that = this;
    return {
      heading: that.position.heading,
      roll: that.position.roll,
      tilt: that.position.tilt,
      
      x: that.position.x,
      y: that.position.y,
      z: that.position.z
    }
  }
  
  objectControl.prototype.appendChild = function( child ){
    var that = this;
    that.childNodes.push( child );
  }
  return objectControl;
}
