'use strict';

window.srcFiles = [
  //'/libs/webgl-debug.js',
  '/src/Start.js',
  '/src/Vec3.js',
  '/src/Mat4.js',
  '/src/Mat3.js',
  '/src/Camera.js',
  '/src/BufferManager.js',
  '/src/DataManager.js',
  '/src/ControlManager.js',
  '/src/TextureManager.js',
  '/src/GUI.js',
  '/src/ShaderManager.js',
  '/src/RendererManager.js',
  '/src/Physics.js'
];

var length = window.srcFiles.length;
var src = window.srcFiles;
(function fetchSources(args){
  require([src[args]], function(){
    if (++args < length)
      fetchSources(args);
    else  
      window.engine = new engine();
  });
})(0);