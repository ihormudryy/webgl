window.MatrixArray = function (len) {
  var arr = new Array();
  var i = 0;
  while (i < len) {
      arr.push(0);
      i++;
  }
  return arr;
};

'use strict';

function engine(){  

  var _engine = {};
  window._engine = _engine;
  _engine.mat4 = new this.Mat4();
  _engine.mat3 = new this.Mat3();
  _engine.vec3 = new this.Vec3();
  _engine.camera = new this.Camera();
  _engine.shaderManager = new this.ShaderManager();
  _engine.shaderManager.initShaders();
  _engine.physic = new this.PhysicManager(_engine);  
  _engine.bufferManager = new this.BufferManager(_engine.shaderManager.gl);
  _engine.textureManager = new this.TextureManager(_engine.shaderManager.gl);
  _engine.controlManager = new this.ControlManager();
  _engine.dataManager = new this.DataManager(_engine);
  _engine.rendererManager = new this.RendererManager(_engine);  
  _engine.gui = new this.GUI();
  
  _engine.textureManager.mipmap = true;
  _engine.gui.addcamera(_engine.camera);
  _engine.controlManager.bindCameraControls(_engine); //Add event listners for mouse and keyboards controls
  _engine.controlManager.completeSelectList(_engine.dataManager.resources); //Add options to dropdown list
  
  _engine.physic.setFreeCameraMode();
  
  _engine.rendererManager.start(); //Load first object and start rendering
  var requestAnimationFrame = window.requestAnimationFrame || 
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame || 
                              function(callback){
                                window.setTimeout(callback, 1000 / 60);
                              };
                              
  var performance = (typeof Stats === 'function') ? new Stats() : undefined;    
  document.getElementById('fps').appendChild(performance.domElement);
  
  _engine.shaderManager.animationFrame = function(){
    performance.update();   
    var gl = _engine.shaderManager.gl;
    var cam = _engine.camera;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(cam.bgColor[0]/255, cam.bgColor[1]/255, cam.bgColor[2]/255, cam.bgColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT); 
    _engine.rendererManager.draw();
    _engine.dataManager.checkLoaderVisibility();    
    _engine.shaderManager.frameId = requestAnimationFrame(_engine.shaderManager.animationFrame);
  };
  
  _engine.shaderManager.frameId = _engine.shaderManager.animationFrame();
};

window.onload = function(){
  if (!window.srcFiles) 
    window.engine = new engine();
  var comertial = document.getElementById('ho_adv');
  if (comertial)
    comertial.parentNode.removeChild(comertial)
};