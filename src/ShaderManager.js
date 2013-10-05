var engine = engine || {};

'use strict';

engine.prototype.ShaderManager = function(){
  
  var shaderManager = {};
  var shaderSrc = "/src/shader.xml";
 
  shaderManager.initShaders = function(){
    var that = this;
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
    
    that.getWebglContext(canvas);
  }
  
  /*
   * Get Webgl context 
   */
  shaderManager.getWebglContext = function(canvas){
    var that = this;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var types = ["experimental-webgl", "webgl", "webkit-3d", "moz-webgl"];
    
    for (var i in types){
      that.gl = canvas.getContext(types[i]) || that.gl;
    };
    
    if (!that.gl){
      console.error('Webgl is faled to start! Please restart browser and try again');
      alert('Webgl is faled to start! Please restart browser and try again');
      return undefined;
    }
    
    that.gl.id = Math.floor(Math.random(999)* 100);
    that.gl.viewportWidth = width;
    that.gl.viewportHeight = height;

    that.loadShaders();
  }
  
  /* 
   * Get shaders 
   */
  shaderManager.loadShaders = function(){
    var that = this;
    
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
          element.innerHTML = 'Failed to load shader!!!';
          return underfined;
        };      
      }
      
      that.compileShaders(shaders);
    }
    
    /* 
     * Load shaders from XML file using asynchronus requests 
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
            element.innerHTML = "XML shaders are not found!";
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
  shaderManager.compileShaders = function(_shaders){    
    var that = this;
    var gl = that.gl;
    var shaders_cache = new Array();
    
    for (var sh in _shaders){
        var type = sh.toUpperCase() + '_SHADER';
        _currentShader = gl.createShader(gl[type]);
        shaders_cache.push(_currentShader);
        gl.shaderSource(_currentShader, _shaders[sh]);
        gl.compileShader(_currentShader);
    }
    
    that.createAndAttachProgramToShader(shaders_cache);
  }
  
  /*
   *  Create program 
   */
  shaderManager.createAndAttachProgramToShader = function(shadersCache){  
    var that = this;
    var gl = that.gl;
    
    that.shaderProgram = gl.createProgram();
    if (that.shaderProgram){
      that.shaderProgram.id = Math.floor(Math.random(212)* 100);
      for (var s in shadersCache){
          var shader = shadersCache[s];
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error' + gl.getShaderInfoLog(shader));
            return null;
          } else {
            gl.attachShader(that.shaderProgram, shader);
          }
      }
      
      that.linkAndUseProgram(that.shaderProgram);
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
  shaderManager.linkAndUseProgram = function(){ 
    var that = this;
    var gl = that.gl;
    var shaderProgram = that.shaderProgram;

    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Could not initialise shader");
      return null;
    } else {
      gl.useProgram(shaderProgram);
    }
    
    that.activateAttributes(shaderProgram);
    that.activateUniforms(shaderProgram);
    that.setupParameters();
  }
  
  /* 
   * Activate attributes
   */
  shaderManager.activateAttributes = function(){ 
    var that = this;
    var gl = that.gl;
    var shaderProgram = that.shaderProgram;
    
    var attribCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; attribCount > i; i++){
      var info = gl.getActiveAttrib(shaderProgram, i);
      shaderProgram[info.name] = gl.getAttribLocation(shaderProgram, info.name);
      gl.enableVertexAttribArray(shaderProgram[info.name]);
    }
  }
  
  /* 
   * Activate attributes
   */
  shaderManager.activateUniforms = function(){ 
    var that = this;
    var gl = that.gl;
    var shaderProgram = that.shaderProgram;
    
    var unifCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
    for (var i = 0; unifCount > i; i++){
      var info = gl.getActiveUniform(shaderProgram, i);
      shaderProgram[info.name] = gl.getUniformLocation(shaderProgram, info.name);
      gl.enableVertexAttribArray(shaderProgram[info.name]);
    }
  }
 
  /* 
   * Setup parameters
   */
  shaderManager.setupParameters = function(){ 
    var that = this;
    var gl = that.gl;
    
    gl.clearColor(0.53, 0.8, 0.98, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.STENCIL_TEST);
    gl.enable(gl.SCISSOR_TEST);
    gl.depthFunc(gl.LEQUAL);
  }
  
  shaderManager.checkBrowserCompatibility = function(){
    var agent = navigator.userAgent;
    var supportedBroswers = ['Chrome', 'Firefox', 'Opera', 'Safari'];
    var notSupported = true;
    for (var i in supportedBroswers)
      if (agent.indexOf(supportedBroswers[i]) != -1)
        notSupported = false;
    
    return notSupported;
  }
  
  return shaderManager;
};
