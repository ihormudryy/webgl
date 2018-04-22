var Engine = Engine || {};

'use strict';

Engine.prototype.ShaderManager = function(){
 
  function shaderManager(){
    var that = this;
    that.shaders = [];
    var element = document.getElementById("webgl");
    
    if (!element){
      var body = document.getElementsByTagName("body")[0];
      element = document.createElement("div");
      element.id = "webgl";
      body.appendChild(element);
    };
    
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvas = document.createElement("canvas");
    element.appendChild(canvas);
    canvas.setAttribute('width', width + 'px;');
    canvas.setAttribute('height', height + 'px;');

    if (that.checkBrowserCompatibility()) {
      element.innerHTML = "Your browser does not support WebGL! Please install the lastet version of Chrome, Firefox or Opera";
      return -1;
    };
    
    if (window.WebGLDebugUtils !== undefined)
      canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
      
    function restoreWebgl(){
      console.log('Webgl context was restored!');
      that.getWebglContext(canvas);
      
      if (window._engine){
        _engine.dataManager.staticResources = 0;
        _engine.rendererManager.removeAllObjects();
        _engine.rendererManager.start();
      }
      
      if (typeof that.animationFrame == 'function')
        that.animationFrame();
    }
    
    canvas.addEventListener("webglcontextlost", function(event) {
      console.info('Webgl context was lost');
      event.preventDefault();
      window.cancelAnimationFrame(that.frameId);
      restoreWebgl();
    }, false);
    
    
    canvas.addEventListener("webglcontextrestored", restoreWebgl, false);  
    
    return that.getWebglContext(canvas);
  }
  
  /*
   * Get Webgl context 
   */
  shaderManager.prototype.getWebglContext = function(canvas){
    var that = this;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var types = ["experimental-webgl", "webgl", "webkit-3d", "moz-webgl"];
    var gl;
    for (var i in types){
      gl = canvas.getContext(types[i]) || gl;
    };
    
    if (!gl){
      console.error('Webgl is faled to start! Please restart browser and try again');
      alert('Webgl is faled to start! Please restart browser and try again');
      return undefined;
    }
    
    gl.id = Math.floor(Math.random(999)* 100);
    gl.viewportWidth = width;
    gl.viewportHeight = height;
    that.gl = gl;
    
    return that;
  }
  
  /* 
   * Get shader 
   *
   * @shaderName [String] - Optional
   *
   */
  shaderManager.prototype.loadShader = function(shaderName, folder, name){
    var that = this;
    var progamName = (name) ? name : shaderName.split('.xml')[0];
    var src = (folder) ? folder : 'shaders';
    var shaderSrc = src + '/' + shaderName;
    
    function initializeShadersAfterDonwload(data){
      var shaders = {};
      var root = data.firstChild;
      if (root.nodeName != 'shader') {
        console.error('Failed to parse shaders');
        return null;
      } else {
        var node = root.firstChild;
        
        while(node){
          if (node.nodeName !== '#text') shaders[node.nodeName] = node.textContent;
          node = node.nextSibling;
        }
        
        if (!shaders.fragment || !shaders.vertex){
          console.error('Failed to load shader');
          return underfined;
        };      
      }
      
      that.compileShaders(shaders, progamName);
    }
    
    /* 
     * Load shaders from XML file using asynchronous requests 
     */
    var xmlhttp = new XMLHttpRequest();

    if (xmlhttp){
      xmlhttp.open("GET", shaderSrc, false);
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status == 0 || xmlhttp.status == 200 || xmlhttp.status == 304 || (!xmlhttp.status)){
            var data = xmlhttp.responseXML;
            if (data)
              initializeShadersAfterDonwload(data);
            else 
              console.error("Shader XML file was not loaded. Take a look into ShaderManager.js");
          } else {
            alert(xmlhttp.readyState);
            alert(xmlhttp.statuss);
            console.error("XML shaders are not found!");
            return null;
          }
        }
        
      };
      xmlhttp.send(null);
    } else {
      alert('AJAX requests are not supported!')
      return -1;
    }    
  } 
  
  /*
   *  Complile shaders 
   */
  shaderManager.prototype.compileShaders = function(_shaders, _name){    
    var that = this;
    var gl = that.gl;
    var shaders_cache = new Array();
    
    for (var sh in _shaders){
        var type = sh.toUpperCase() + '_SHADER';
        var _currentShader = gl.createShader(gl[type]);
        shaders_cache.push(_currentShader);
        gl.shaderSource(_currentShader, _shaders[sh]);
        gl.compileShader(_currentShader);
    }
    
    that.createAndAttachProgramToShader(shaders_cache, _name);
  }
  
  /*
   *  Create program 
   */
  shaderManager.prototype.createAndAttachProgramToShader = function(shadersCache, _name){  
    var that = this;
    var gl = that.gl;
    var _program = gl.createProgram();
    that.shaders.push(_program);
    _program.name = _name;
    
    if ( _program ){
      _program.id = Math.floor(Math.random(212)* 100);
      for (var s in shadersCache){
          var shader = shadersCache[s];
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error' + gl.getShaderInfoLog(shader));
            return null;
          } else {
            gl.attachShader( _program, shader );
          }
      }
      
      that.linkAndUseProgram( _program );
    } else {
      var error = 'Could not get shader program. Please restart the browser.'
      console.error(error);
      alert(error);
      return unedfined;
    }    
  }
  
  /* 
   * Link program
   */
  shaderManager.prototype.linkAndUseProgram = function(program){ 
    var that = this;
    var gl = that.gl;

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Could not initialise shader");
      return null;
    } else {
      gl.useProgram(program);
    }
    
    that.activateAttributes(program);
    that.activateUniforms(program);
    that.setupParameters();
  }
  
  /* 
   * Activate attributes
   */
  shaderManager.prototype.activateAttributes = function(program){ 
    var that = this;
    var gl = that.gl;
    
    var attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    program.attributes = {};
    for (var i = 0; attribCount > i; i++){
      var info = gl.getActiveAttrib(program, i);
      program.attributes[info.name] = gl.getAttribLocation(program, info.name);
      gl.enableVertexAttribArray(program.attributes[info.name]);
    }
  }
  
  /* 
   * Activate attributes
   */
  shaderManager.prototype.activateUniforms = function(program){ 
    var that = this;
    var gl = that.gl;
    
    var unifCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    program.uniforms = {};
    for (var i = 0; unifCount > i; i++){
      var info = gl.getActiveUniform(program, i);
      program.uniforms[info.name] = gl.getUniformLocation(program, info.name);
      gl.enableVertexAttribArray(program.uniforms[info.name]);
    }
  }
 
  /* 
   * Setup parameters
   */
  shaderManager.prototype.setupParameters = function(){ 
    var that = this;
    var gl = that.gl;
    
    gl.clearColor(0, 0, 0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.STENCIL_TEST);
    gl.enable(gl.SCISSOR_TEST);
    gl.depthFunc(gl.LEQUAL);
  }
  
  shaderManager.prototype.checkBrowserCompatibility = function(){
    var agent = navigator.userAgent;
    var supportedBroswers = ['Chrome', 'Firefox', 'Opera', 'Safari'];
    var notSupported = true;
    for (var i in supportedBroswers)
      if (agent.indexOf(supportedBroswers[i]) != -1)
        notSupported = false;
    
    return notSupported;
  }
  
  return new shaderManager();
};
