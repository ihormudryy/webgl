'use strict';

function Engine(){  

  var _engine = {};
  
  _engine.FPS = (typeof Stats === 'function') ? new Stats() : undefined;    
  document.getElementById('fps').appendChild(_engine.FPS.domElement);
  
  window._engine = _engine;
  _engine.datGUI = new this.GUI();
  _engine.vec3 = new this.Vec3();
  _engine.mat3 = new this.Mat3();
  _engine.mat4 = new this.Mat4();
  _engine.shaderManager = new this.ShaderManager();
  _engine.shaderManager.loadShader('shadow_map.xml', 'src/shaders', 'Shadow');
  _engine.shaderManager.loadShader('shader.xml', 'src/shaders', 'Camera');
  _engine.objectControl = new this.ObjectControl(_engine);  
  _engine.physic = new this.PhysicManager(_engine);  
  _engine.controlManager = new this.ControlManager(_engine);
  _engine.camera = new this.Camera(_engine);
  _engine.bufferManager = new this.BufferManager(_engine.shaderManager.gl);
  _engine.textureManager = new this.TextureManager(_engine.shaderManager.gl);
  _engine.textureManager.mipmap = true;
  _engine.dataManager = new this.DataManager(_engine);
  _engine.rendererManager = new this.RendererManager(_engine);
  _engine.rendererManager.start();
};

window.onload = function(){
  if (!window.srcFiles) 
    window.engine = new Engine();
  var comertial = document.getElementById('ho_adv');
  if (comertial)
    comertial.parentNode.removeChild(comertial)
};