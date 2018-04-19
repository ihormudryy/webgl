var Engine = Engine || {};

'use strict';

Engine.prototype.BufferManager = function(gl) {

    var bufferManager = {};
    var gl = gl;
    bufferManager.vertexBufferCache = new Array();
    bufferManager.indexBufferCache = new Array();
    
    bufferManager.initBuffer = function (vertices) {
      var that = this;
      var _buffer = gl.createBuffer();
      
      if (vertices.length > 0){
        that.vertexBufferCache.push({buffer: _buffer, vertices: vertices});
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        return _buffer;
      } else 
        return null;
    };
    
    bufferManager.initIndexBuffer = function (indices) {
      var that = this;
      var _buffer = gl.createBuffer();
      
      if (indices.length > 0){
        that.indexBufferCache.push({buffer: _buffer, indices: indices});
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return _buffer;
      } else 
        return null;
    };

    bufferManager.rebindBuffers = function(_gl){
      var that = this;
      
      for (var v in that.vertexBufferCache){
        _gl.deleteBuffer(that.vertexBufferCache[v].buffer);
        var vBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, vBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(that.vertexBufferCache[v].vertices), _gl.STATIC_DRAW);
      }
      
      for (var i in that.indexBufferCache){
        _gl.deleteBuffer(that.vertexBufferCache[i].buffer);
        var iBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(that.indexBufferCache[i].indices), _gl.STATIC_DRAW);
      }
    }
    
    bufferManager.createFrameBufferObject = function(size){
      var size = (size) ? size : 512;

      var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture") || 
                            gl.getExtension("MOZ_WEBGL_depth_texture");  
      var colorTexture = gl.createTexture();
      var depthTexture = gl.createTexture();
      
      gl.bindTexture(gl.TEXTURE_2D, colorTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      
      if(depthTextureExt){
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
      }
      
      var framebuffer = gl.createFramebuffer();
      framebuffer.width = size;
      framebuffer.height = size;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
      depthTextureExt && gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
      
      if(!gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
        console.error("Frame buffer incomplete!");
      }
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      return {
              colorTexture: colorTexture,
              depthTexture: depthTexture,
              frameBuffer: framebuffer
             };
    }
    
    return bufferManager;
};