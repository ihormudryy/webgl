var engine = engine || {};

'use strict';

engine.prototype.BufferManager = function (gl) {
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
    
    return bufferManager;
};