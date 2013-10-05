var engine = engine || {};

'use strict';

engine.prototype.TextureManager = function (gl) {
  var textureManager = {};
  var gl = gl;
  textureManager.pendingDowloads = 0;
  
  textureManager.createTexture = function (srcURI, callback) { 
    var that = this;
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function(){
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
      texture.mipmap = true;
      texture.clamp = false;
      
      if (texture.clamp) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      }
      if (texture.use_nearest) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        if (texture.mipmap) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (texture.mipmap) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
      }
      if (texture.mipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }

      gl.bindTexture(gl.TEXTURE_2D, null);
      texture.width = texture.image.naturalWidth;
      texture.height = texture.image.naturalHeight;
      
      if (texture.image.src.indexOf('blended') !== -1) texture.blending = true;
      
      texture.state = 'ready';
      that.pendingDowloads--;
      if (that.pendingDowloads == 0 && typeof callback === 'function')
        callback(texture);
    }
    if (srcURI) {
      texture.image.src = srcURI;
      that.pendingDowloads++;
      return texture
    }
      else return null;
  };
  
  textureManager.createTextureFrameBuffer = function (srcArray, callback) { 
    var index = 0;
    
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = 1024;
    framebuffer.height = 512;
    framebuffer.textures = new Array();
    
    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);
    
    for (index; index < srcArray.length; index++){
      var texture = gl.createTexture();
      texture.image = new Image();
      
      texture.image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        if (texture.use_nearest) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          if (texture.mipmap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
          } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          }
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          if (texture.mipmap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
          } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          }
        }
        if (texture.mipmap) {
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
      
        gl.bindTexture(gl.TEXTURE_2D, null);

        if (index == srcArray.length - 1){
          gl.bindRenderbuffer(gl.RENDERBUFFER, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          if (typeof callback === 'function') callback();
        }
      }

      texture.image.src = srcArray[index];
    }
    return framebuffer;
  };
  
  return textureManager;
};