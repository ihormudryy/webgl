var Engine = Engine || {};

'use strict';

Engine.prototype.RendererManager = function ( _engine ) {

    var gl = _engine.shaderManager.gl;
    var mat3 = _engine.mat3;
    var mat4 = _engine.mat4;
    var vec3 = _engine.vec3;
    var mvMatrixStack = [];
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create(); 
    var lOrigMatrix = mat4.create();
    var lDirMatrix = mat4.create();
    var shaders = _engine.shaderManager.shaders;
    var physic = _engine.physic;
    var camera = _engine.camera;
    var controlManager = _engine.controlManager;
    var dataManager = _engine.dataManager;
    var textureManager = _engine.textureManager;
    var objectControl = _engine.objectControl;
    var datGUI = _engine.datGUI;
    var FPS = _engine.FPS;
    var program;
    
    function rendererManager(){
      var that = this;
      that.stereoscopicMode = false;
      that.pixelsInCm = 38;
      that.interocular = 6.5;
    }
    
    /* 
      All modification regarding adding or removing rootObject at the start are made here 
    */
    rendererManager.prototype.start = function(src){
      var that = this;
      dataManager.initialize();
      
      var requestAnimationFrame = window.requestAnimationFrame || 
                                  window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame ||
                                  window.msRequestAnimationFrame || 
                                  function(callback){
                                    window.setTimeout(callback, 1000 / 60);
                                  };
                              

      (function animationFrame(){
        that.render();
        FPS.update();   
        dataManager.checkLoaderVisibility();    
        requestAnimationFrame( animationFrame );
      })();
    }
    
    rendererManager.prototype.mvMatrixInit = function() {
      mvMatrix = mat4.create();
    }
    
    rendererManager.prototype.mvPushMatrix = function() {
      var copy = mat4.create(mvMatrix);
      mvMatrixStack.push(copy);
      mat4.identity(mvMatrix);
    }

    rendererManager.prototype.mvPopMatrix = function() {
      if (mvMatrixStack.length !== 0) {
        mvMatrix = mvMatrixStack.pop();
      }
    }
    
    rendererManager.prototype.resize = function(evt, height, width){
      var that = this;

      if (height){
        gl.canvas.height = height;
        gl.viewportHeight = height;
      } else {  
        gl.canvas.height = window.innerHeight;
        gl.viewportHeight = window.innerHeight;
      }
      
      if (width){
        gl.canvas.width = width;
        gl.viewportWidth = width;
      } else {
        gl.canvas.width = window.innerWidth;
        gl.viewportWidth = window.innerWidth;
      }
      return;
    }
    
    rendererManager.prototype.setBlending = function( flag ) {
      var that = this;
      if (flag) {
        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        that.setUniform("1f", "uAlpha", camera.getAttribute("SRC_ALPHA")); 
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        rendererManager.blending = true;
      } else {
        gl.disable(gl.BLEND);
        that.setUniform("1f", "uAlpha", 1); 
        gl.enable(gl.DEPTH_TEST);
        rendererManager.blending = false;
      }
    }
   
    rendererManager.prototype.lookAtPoint = function(eyePosVec, targetPosVec, cameraNormal){
      var up = (cameraNormal) ? cameraNormal : [eyePosVec[0], eyePosVec[1] + 1, eyePosVec[2]];
      var vz = vec3.normalize([eyePosVec[0] - targetPosVec[0], eyePosVec[1] - targetPosVec[1], eyePosVec[2] - targetPosVec[2]]);
      var vx = vec3.normalize(vec3.crossProd(up, vz));
      var vy = vec3.crossProd(vz, vx);
      var inverseViewMatrix = [vx[0], vx[1], vx[2], 0.0, 
                               vy[0], vy[1], vy[2], 0.0, 
                               vz[0], vz[1], vz[2], 0.0, 
                               eyePosVec[0], eyePosVec[1], eyePosVec[2], 1];
      return inverseViewMatrix; 
    }
    
    rendererManager.prototype.bindVertices = function( mesh ){
      var that = this;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
      window.debug && console.log(mesh.vertexFormat);
      if (mesh.vertexFormat === 'XYZUV' || mesh.vertexFormat === 'XYZUVN' || mesh.vertexFormat === 'XYZN') {  
        that.setAttribute("aVertexPosition", 3, "FLOAT", mesh.vertex_stride, 0);
        
        window.debug && console.log("aVertexPositionmesh stride " + mesh.vertex_stride + " offset " + 0);

        if (mesh.vertexFormat === 'XYZUV' || mesh.vertexFormat === 'XYZUVN'){
          that.setUniform("1i", "uUseTextureAtlas", true);
          that.setAttribute("aTextureCoord", 2, "FLOAT", mesh.vertex_stride, 12);
          window.debug && console.log("aTextureCoord stride " + mesh.vertex_stride + " offset " + 12);
        } else {
          that.setUniform("1i", "uUseTextureAtlas", false);
        }
        
        if (mesh.vertexFormat === 'XYZUVN' || mesh.vertexFormat === 'XYZN') {
          var offset = (mesh.vertexFormat === 'XYZUVN') ? 20 : 12;
          that.setAttribute("aVertexNormal", 3, "FLOAT", mesh.vertex_stride, offset);
          window.debug && console.log("aVertexNormal stride " + mesh.vertex_stride + " offset " + offset);
        } 
      } else {
        that.setAttribute("aVertexPosition", 3, "FLOAT", 0, 0);
        if (mesh.normalsBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalsBuffer);
          that.setAttribute("aVertexNormal", 3, "FLOAT", 0, 0);
        } 
        
        if (mesh.textureBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
          that.setAttribute("aTextureCoord", 2, "FLOAT", 0, 0);
        } else {
          mode = gl.LINE_LOOP;
        }
      }
    }
    
    rendererManager.prototype.drawElements = function( ){
      var that = this;
      var rootObject = dataManager.getRootObject();
      that.setUniform("Texture", "shadowMap", dataManager.shadow.colorTexture, 2);   
      that.updateLight( ); 
      for (var i in rootObject){          
        var mesh = rootObject[i];
        if (mesh.state == "ready"){
          that.bindVertices( mesh );
          that.setUniform("1i", "uUseTextureAtlas", camera.getAttribute("useTextureAtlas"));
          
          if( mesh.controls ){
            mesh.controls.update();
            that.setUniform("4fv", "uModelMatrix", mesh.controls.matModel);
          }
          
          var cachedTexture;
          if ( mesh.childNodes ){
            if (mesh.childNodes[0]) cachedTexture = mesh.childNodes[0].textureName;
            for (var j in mesh.childNodes){
              
              if( mesh.childNodes[j].controls ){
                that.setUniform("4fv", "uModelMatrix", mesh.childNodes[j].controls.matModel);
              }
              
              var glTexture = mesh.childNodes[j].gl_Texture;
              var mtl = mesh.childNodes[j].mtl;
              var name = mesh.childNodes[j].textureName;

              if (glTexture.state === "ready" && textureManager.pendingDowloads == 0) {

                if (mesh.updateTexture) mesh.updateTexture();
                
                if (name !== cachedTexture || j == 0) { 
                  that.setUniform("Texture", "uSampler", glTexture, 0);
                  cachedTexture = name;
                }
                
                if (mesh.terrain && mesh.terrain.state == "ready"){
                  that.setUniform("1i", "uUseTerrain", camera.getAttribute("useTerrain")); 
                  that.setUniform("1f", "uTerrainCoefficient", camera.getAttribute("terrainCoefficient"));                  
                  that.setUniform("Texture", "uTerrain", glTexture, 1);
                } else that.setUniform("1i", "uUseTerrain", false);
                
                that.renderLight( mtl );
                
                if (mesh.indexBuffer){
                
                  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
     
                  if (glTexture.blending) 
                    that.setBlending(glTexture.blending );
                  else if (that.glTexture !== camera.getAttribute("blending"))
                    that.setBlending( camera.getAttribute("blending") );
                  
                  var count = (mesh.childNodes && mesh.childNodes[j].count) ? 
                               mesh.childNodes[j].count : 
                               mesh.size;
                               
                  var offset = (mesh.childNodes && mesh.childNodes[j].offset) ? 
                                mesh.childNodes[j].offset << 1 : 
                                0;
                  gl.drawElements(camera.getAttribute("MODE"), count, gl.UNSIGNED_SHORT, offset);                
                  
                } else { 
                  gl.drawArrays(camera.getAttribute("MODE"), 0, mesh.size);
                  
                }  
              }
            } 
          } else {
          
            if (mesh.terrain && mesh.terrain.state == "ready"){
              that.setUniform("1i", "uUseTerrain", camera.getAttribute("useTerrain")); 
              that.setUniform("1f", "uTerrainCoefficient", camera.getAttribute("terrainCoefficient")); 
              that.setUniform("Texture", "uTerrain", mesh.terrain, 1);
            } else {
              that.setUniform("1i", "uUseTerrain", false);
            }
             
            if (mesh.indexBuffer) {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
              gl.drawElements(camera.getAttribute("MODE"), mesh.size, gl.UNSIGNED_SHORT, 0); 
            } else {
              gl.drawArrays(3, 0, mesh.size);            
            }
          }
        }
      }
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    var view = new objectControl("View", null, true);
    
    rendererManager.prototype.render = function( ) {     
      var that = this;
      for (var _program in shaders){
        
        var width = gl.viewportWidth;
        var height = gl.viewportHeight;
        var clear = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;// | gl.STENCIL_BUFFER_BIT;
        var colMask = true;
        var eyeOffset = 0;
        var eyeOffsetEnd = 1;
        var diagonal = Math.sqrt(width*width + height*height);
        var separation = camera.getAttribute("stereo_Separation") * that.pixelsInCm / diagonal;
        var cull = gl.BACK;

        that.drawShadow = shaders[_program].name === "Shadow";
        
        if ( camera.getAttribute("stereoscopicMode") ) {
          eyeOffset = -1;
          eyeOffsetEnd = 1;
        }
        
        if (that.drawShadow){
          if (!dataManager.light.controls.properties.useShadowMap || !dataManager.light.useLighting) continue;
          width = dataManager.shadow.frameBuffer.width;
          height = dataManager.shadow.frameBuffer.height;
          cull = gl.FRONT;
          mvMatrix = dataManager.light.controls.update();
          gl.bindFramebuffer(gl.FRAMEBUFFER, dataManager.shadow.frameBuffer);
        } else {
          // mvMatrix = view.update.update();
          // camera.controls.update();
          mvMatrix = mat4.multiply(camera.controls.update(), view.update());
        }
        
        
        var backgroud = camera.getAttribute("bgColor");
        gl.viewport(0, 0, width, height);
        gl.clearColor(backgroud[0]/255, backgroud[1]/255,backgroud[2]/255, backgroud[3]);
        gl.clear(clear);
        gl.cullFace( cull );
        that.activateProgram( shaders[_program] );
        
        for(eyeOffset; eyeOffset <= eyeOffsetEnd; eyeOffset += 2){   

          switch(eyeOffset) {
            case 0:
              gl.colorMask(colMask, colMask, colMask, colMask);
              break;
            case -1:
              that.setStereoProperties( -1, separation );         
              break;
            case 1:
              that.setStereoProperties( 1, separation );   
              break;
          }
          
          var fov = camera.getFieldOfView();
          var zNear = camera.getAttribute('zNear');
          var zFar = camera.getAttribute('zFar');
          mat4.perspective( fov, width, height, zNear, zFar, pMatrix );
          mat4.translate( mvMatrix, [eyeOffset * separation, 0, 0]);
          that.setMarixUniforms( mvMatrix, pMatrix );
          
          that.drawElements( );
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.colorMask(true, true, true, true);
      }
    }   
        
    rendererManager.prototype.setMarixUniforms = function( mvMat, pMat ){
      var that = this;
      that.setUniform("4fv", "uCameraViewMatrix", mvMat); 
      that.setUniform("4fv", "uCameraProjMatrix", pMat); 
      var normalMatrix = mat3.create();
      mat4.toInverseMat3(mvMat, normalMatrix);
      mat3.transpose(normalMatrix);
      that.setUniform("3fv", "uNMatrix", normalMatrix);
    }
    
    rendererManager.prototype.setAttribute = function( attributeName, size, type, vertex_stride, offset ){
      var attribute = program.attributes[attributeName];
      gl.vertexAttribPointer(attribute, size, gl[type], false, vertex_stride, offset);
    }
    
    rendererManager.prototype.setUniform = function( type, uniformName, value, index ){
      var uniform = program.uniforms[uniformName];
      if( uniform ){
        switch(type){
          case "1f":
            gl.uniform1f( uniform, value );
            break;
          case "1i":
            gl.uniform1i( uniform, value );
            break;
          case "3f":
            gl.uniform3f( uniform, value[0], value[2], value[2] );
            break;
          case "3fv":
            gl.uniformMatrix3fv( uniform, false, value );      
            break;
          case "4fv":
            gl.uniformMatrix4fv( uniform, false, value );      
            break;
          case "Texture":
            gl.activeTexture(gl['TEXTURE0'] + index);
            gl.uniform1i(uniform, index); 
            gl.bindTexture(gl.TEXTURE_2D, value);
            break;
        }
      }
    }
    
    rendererManager.prototype.setStereoProperties = function( mode, sep ){
      var that = this;
      var red = (mode == -1) ? false : true;
      var green = (mode == -1) ? true : false;
      var blue = (mode == -1) ? true : false;
      gl.colorMask(red, green, blue, true);
      that.setUniform("1i", "uStereoMode", true);    
      that.setUniform("1f", "uEyeSign", mode);    
      that.setUniform("1f", "uEyeSeparation", sep);    
    }
    
    rendererManager.prototype.updateLight = function( ){
      var that = this;
      var light = dataManager.light;
      if (!light) return;
      var w = dataManager.shadow.frameBuffer.width;
      var h = dataManager.shadow.frameBuffer.height;
      var lightViewMat = light.controls.update();
      var lightProjMat = mat4.create();
      var fov = camera.getFieldOfView();
      var zNear = camera.getAttribute('zNear');
      var zFar = camera.getAttribute('zFar');
      mat4.perspective( fov, w, h, zNear, zFar, lightProjMat );
      var lightRotationMat = mat3.rotFromMat4(lightViewMat);
      that.setUniform("3fv", "uLightRotationMat", lightRotationMat);
      that.setUniform("4fv", "uLightViewMat", lightViewMat);      
      that.setUniform("4fv", "uLightProjwMat", lightProjMat);      
      that.setUniform("1i", "uUseLighting", light.useLighting);    
      that.setUniform("1i", "uUseShadowMap", light.useShadowMap);    
      that.setUniform("1f", "uPower", light.power.val);    
      that.setUniform("1f", "uAdjust", light.adjust.val);    
      that.setUniform("1f", "uMaterialShininess", light.materialShininess.val);    
      that.setUniform("1f", "lightRadius", light.lightRadius.val);    
      that.setUniform("1f", "lightSpotInnerAngle", light.lightSpotInnerAngle.val);    
      that.setUniform("1f", "lightSpotOuterAngle", light.lightSpotOuterAngle.val); 
    }
    
    rendererManager.prototype.renderLight = function( mlt ){
      var that = this;
      var light = dataManager.light;
      
      if (!light) return;
      
      var a0 = light.ambientColor[0] * .01;
      var a1 = light.ambientColor[1] * .01;
      var a2 = light.ambientColor[2] * .01;
      var d0 = light.diffuseColor[0] * .01;
      var d1 = light.diffuseColor[1] * .01;
      var d2 = light.diffuseColor[2] * .01;
      var s0 = light.specularColor[0] * .01;
      var s1 = light.specularColor[1] * .01;
      var s2 = light.specularColor[2] * .01;      
        
      that.setUniform("3f", "uAmbientColor", (mlt && mlt.Ka && light.useSpecularMap) ? mlt.Ka : [a0, a1, a2]);
      that.setUniform("3f", "uDiffuseColor", (mlt && mlt.Kd && light.useSpecularMap) ? mlt.Kd : [d0, d1, d2]); 
      that.setUniform("3f", "uSpecularColor", (mlt && mlt.Ks && light.useSpecularMap) ? mlt.Ks : [s0, s1, s2]);  
    
      if (mlt && mlt.bump_map_texture){
        that.setUniform("1i", "uUseSpecularMap", light.useSpecularMap);    
        that.setUniform("Texture", program.uSpecularMapSampler, mlt.bump_map_texture, 3);
      } else {
        that.setUniform("1i", "uUseSpecularMap", false);    
      }     
    }

    rendererManager.prototype.activateProgram = function( prog ){
      program = prog;
      gl.useProgram(program);
    }
    
    rendererManager.prototype.setStereoscopicMode = function(flag){
      that.stereoscopicMode = (flag) ? flag : !that.stereoscopicMode;
    }
    
    return new rendererManager();
};