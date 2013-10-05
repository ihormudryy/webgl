var engine = engine || {};

'use strict';

engine.prototype.RendererManager = function (_engine) {
    
    var rendererManager = {};
    var shaderManager = _engine.shaderManager;
    var gl = _engine.shaderManager.gl;
    var controlManager = _engine.controlManager;
    var dataManager = _engine.dataManager;
    var textureManager = _engine.textureManager;
    var physic = _engine.physic;
    var mat3 = _engine.mat3;
    var mat4 = _engine.mat4;
    var vec3 = _engine.vec3;
    var camera = _engine.camera;
    var objects = [];
    var mvMatrixStack = [];
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create(); 
    var lOrigMatrix = mat4.create();
    var lDirMatrix = mat4.create();
    
    /* 
      All modification regarding adding or removing objects at the start are made here 
    */
    rendererManager.start = function(src){
      var that = this;
      if (physic.mode == 'game'){
        var groundSurface = dataManager.generateSurface();
        that.add(groundSurface); 
        var sky = dataManager.generateSky();
        that.add(sky); 
      }
      if (!that.loadedModel){
        dataManager.selectModel(function(args){
          //var groundSurface = dataManager.generateSurface();
          //that.add(groundSurface);
          //var cube = dataManager.generateCube();
          //that.add(cube);
          //var video = dataManager.addVideo();
          //that.add(video);
          //that.terrain = dataManager.addTerrain();
          that.add(args); 
        });
      } 
    }
    
    rendererManager.add = function (bufferPool) {
      if (bufferPool) objects.push(bufferPool);
    }
    
    rendererManager.mvMatrixInit = function() {
      mvMatrix = mat4.create();
    }
    
    rendererManager.mvPushMatrix = function() {
      var copy = mat4.create(mvMatrix);
      mvMatrixStack.push(copy);
      mat4.identity(mvMatrix);
    }

    rendererManager.mvPopMatrix = function() {
      if (mvMatrixStack.length !== 0) {
        mvMatrix = mvMatrixStack.pop();
      }
    } 
    
    rendererManager.remove = function (obj) {
      var that = this;
      if (obj){ 
        for (var i in objects) {
          if (obj === objects[i]){
            if (objects[i].vertexBuffer) gl.deleteBuffer(objects[i].vertexBuffer);
            if (objects[i].textureBuffer) gl.deleteBuffer(objects[i].textureBuffer);
            if (objects[i].normalsBuffer) gl.deleteBuffer(objects[i].normalsBuffer);
            for (var t in objects[i].texture){
              objects[i].texture[t].status = 'removed';
              gl.deleteTexture(objects[i].texture[t])
            }
            objects.splice(i, 1);
          }
        }
      } else {
        var index = dataManager.staticResources;
        objects[index].status = 'removed';
        if (objects[index].vertexBuffer) gl.deleteBuffer(objects[index].vertexBuffer);
        if (objects[index].textureBuffer) gl.deleteBuffer(objects[index].textureBuffer);
        if (objects[index].normalsBuffer) gl.deleteBuffer(objects[index].normalsBuffer);
        for (var t in objects[index].textureAtlas){
          objects[index].textureAtlas[t].gl_Texture.state = 'removed';
          gl.deleteTexture(objects[index].textureAtlas[t].gl_Texture)
        }
        objects.splice(index, 1);
      } 
    };
    
    rendererManager.removeAllObjects = function(){
      var that = this;
      for (var i in objects) {
        if (objects[i].vertexBuffer) gl.deleteBuffer(objects[i].vertexBuffer);
        if (objects[i].textureBuffer) gl.deleteBuffer(objects[i].textureBuffer);
        if (objects[i].normalsBuffer) gl.deleteBuffer(objects[i].normalsBuffer);
        for (var t in objects[i].texture){
          objects[i].texture[t].status = 'removed';
          gl.deleteTexture(objects[i].texture[t])
        }
        objects.splice(i, 1);
      }
      delete that.loadedModel;
    }
    
    rendererManager.resize = function(evt, height, width){
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
    
    rendererManager.getCamera = function(logOnConsole){
      if (logOnConsole){
        console.log('screen:{')
        for (var i in camera){
          if (typeof camera[i] == 'object'){
            console.log(i + ': {');
            for (var j in camera[i])
              console.log(' ' + j + ':' + camera[i][j] + ',');
            console.log('},');
          } else 
            console.log(' ' + i + ':' + camera[i] + ',')
        }
        console.log('}');
      }
      return camera;
    }
    
    rendererManager.setBlending = function (flag) {
      if (flag) {
        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.uniform1f(shaderManager.shaderProgram.uAlpha, camera.SRC_ALPHA);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        rendererManager.blending = true;
      } else {
        gl.disable(gl.BLEND);
        gl.uniform1f(shaderManager.shaderProgram.uAlpha, 1);
        gl.enable(gl.DEPTH_TEST);
        rendererManager.blending = false;
      }
    }
       
    rendererManager.lighting = function(mlt){
      var that = this;
      var lightingDirection = [ 
          camera.lightDirection.lightDirectionX,
          camera.lightDirection.lightDirectionY,
          camera.lightDirection.lightDirectionZ
        ];
      var a0 = camera.ambientColor[0] * .01;
      var a1 = camera.ambientColor[1] * .01;
      var a2 = camera.ambientColor[2] * .01;
      var d0 = camera.pointLightingDiffuse[0] * .01;
      var d1 = camera.pointLightingDiffuse[1] * .01;
      var d2 = camera.pointLightingDiffuse[2] * .01;
      var s0 = camera.specularColor[0] * .01;
      var s1 = camera.specularColor[1] * .01;
      var s2 = camera.specularColor[2] * .01;
      
      gl.uniform1i(shaderManager.shaderProgram.uUseLighting, camera.useLighting);
      
      gl.uniform1i(shaderManager.shaderProgram.uUseTextureAtlas, camera.showTextureMap);

      gl.uniform3fv(shaderManager.shaderProgram.uPointLightingVector, lightingDirection); 
      
      gl.uniform1i(shaderManager.shaderProgram.uMaterialShininess, camera.materialShininess); 
      
      /* Set mlt properties */
      if (mlt && camera.useSpecularMap){
      
        if (mlt.Ka){
          var ambient = mlt.Ka;
          gl.uniform3f(shaderManager.shaderProgram.uAmbientColor, ambient[0], ambient[1], ambient[2]);  
        } else {
          gl.uniform3f(shaderManager.shaderProgram.uAmbientColor, a0, a1, a2);  
        }
        
        if (mlt.Ka){
          var difuse = mlt.Kd;
          gl.uniform3f(shaderManager.shaderProgram.uPointLightingDiffuseColor, difuse[0], difuse[1], difuse[2]);  
        } else {
          gl.uniform3f(shaderManager.shaderProgram.uPointLightingDiffuseColor, d0, d1, d2);  
        }
        
        if (mlt.Ka){
          var specular = mlt.Ks;
          gl.uniform3f(shaderManager.shaderProgram.uPointLightingSpecularColor, specular[0], specular[1], specular[2]); 
        } else {
          gl.uniform3f(shaderManager.shaderProgram.uPointLightingSpecularColor, s0, s1, s2);  
        }
        
        if (mlt.bump_map_texture){
          gl.uniform1i(shaderManager.shaderProgram.uUseSpecularMap, camera.useSpecularMap);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, mlt.bump_map_texture);
          gl.uniform1i(shaderManager.shaderProgram.uSpecularMapSampler, 1);
        } else {
          gl.uniform1i(shaderManager.shaderProgram.uUseSpecularMap, false);
        }
      } else {
        gl.uniform3f(shaderManager.shaderProgram.uAmbientColor, a0, a1, a2);
        gl.uniform3f(shaderManager.shaderProgram.uPointLightingDiffuseColor, d0, d1, d2);   
        gl.uniform3f(shaderManager.shaderProgram.uPointLightingSpecularColor, s0, s1, s2); 
        gl.uniform1i(shaderManager.shaderProgram.uUseSpecularMap, false);
      }
    }
    
    rendererManager.lookAtPoint = function(eyePosVec, targetPosVec, cameraNormal){
      var up = (cameraNormal) ? cameraNormal : [eyePosVec[0], eyePosVec[1] + 1, eyePosVec[2]];
      var vz = vec3.normalize([eyePosVec[0] - targetPosVec[0], eyePosVec[1] - targetPosVec[1], eyePosVec[2] - targetPosVec[2]]);
      var vx = vec3.normalize(vec3.crossProd(up, vz));
      var vy = vec3.crossProd(vz, vx);
      var inverseViewMatrix = [vx[0], vx[1], vx[2], 0.0, 
                               vy[0], vy[1], vy[2], 0.0, 
                               vz[0], vz[1], vz[2], 0.0, 
                               eyePosVec[0], eyePosVec[1], eyePosVec[2], 1];
      return inverseViewMatrix; 
    };
    
    rendererManager.setMarixUniforms = function(mvMat, pMat){
      var that = this;
     
      gl.uniformMatrix4fv(shaderManager.shaderProgram.uMVMatrix, false, mvMat);
      gl.uniformMatrix4fv(shaderManager.shaderProgram.uPMatrix, false, pMat);
      
      var normalMatrix = mat3.create();
      
      mat4.toInverseMat3(mvMat, normalMatrix);
      mat3.transpose(normalMatrix);
      
      gl.uniformMatrix3fv(shaderManager.shaderProgram.uNMatrix, false, normalMatrix);
    };
    
    rendererManager.draw = function () {     
      var that = this;
      mat4.perspective(camera.fov, gl.viewportWidth, gl.viewportHeight, camera.zNear, camera.zFar, pMatrix);
      
      var timeStamp = new Date();
      
      //physic.roteteAroundPivot(.1);
      //physic.animateTilt();
      
      mvMatrix = physic.cameraSpace(timeStamp);
      that.setMarixUniforms(mvMatrix, pMatrix);
      
      for (var i in objects){          
        that.mvPushMatrix();
        var mesh = objects[i];
        
        if (mesh.state == "ready"){
          gl.uniform1i(shaderManager.shaderProgram.uFactor, camera.factor);
          if (mesh.vertexFormat === 'XYZUV' || mesh.vertexFormat === 'XYZUVN' || mesh.vertexFormat === 'XYZN') {
            
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
            gl.vertexAttribPointer(shaderManager.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, mesh.vertex_stride, 0);
            
            if (mesh.vertexFormat === 'XYZUV' || mesh.vertexFormat === 'XYZUVN'){
              gl.uniform1i(shaderManager.shaderProgram.uUseTextureAtlas, true);
              gl.vertexAttribPointer(shaderManager.shaderProgram.aTextureCoord, 2, gl.FLOAT, false, mesh.vertex_stride, 12);
            } else {
              gl.disableVertexAttribArray(shaderManager.shaderProgram.aTextureCoord);
              gl.uniform1i(shaderManager.shaderProgram.uUseTextureAtlas, false);
            }
            
            if (mesh.vertexFormat === 'XYZUVN' || mesh.vertexFormat === 'XYZN') {
              var offset = (mesh.vertexFormat === 'XYZUVN') ? 20 : 12;
              gl.vertexAttribPointer(shaderManager.shaderProgram.aVertexNormal, 3, gl.FLOAT, false, mesh.vertex_stride, offset);
            } else {
              //gl.disableVertexAttribArray(shaderManager.shaderProgram.aVertexNormal);
            }
          } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
            gl.vertexAttribPointer(shaderManager.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            if (mesh.normalsBuffer) {
              gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalsBuffer);
              gl.vertexAttribPointer(shaderManager.shaderProgram.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
            } else {
              //gl.disableVertexAttribArray(shaderManager.shaderProgram.aVertexNormal);
            }
            if (mesh.textureBuffer) {
              gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
              gl.vertexAttribPointer(shaderManager.shaderProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            } else {
              mode = gl.LINE_LOOP;
            }
          }
          
          if(mesh.rotate){
            mvMatrix = physic.objectSpace(timeStamp);
            that.setMarixUniforms(mvMatrix, pMatrix);
          }
        
          var cachedTexture;
          if (mesh.textureAtlas){
            if (mesh.textureAtlas[0]) cachedTexture = mesh.textureAtlas[0].textureName;
            // Fetching texture from texture atlas and drwaing 
            for (var j in mesh.textureAtlas){
            
              var glTexture = mesh.textureAtlas[j].gl_Texture;
              var mtl = mesh.textureAtlas[j].mtl;
              var name = mesh.textureAtlas[j].textureName;
              
              
              if (glTexture.state === "ready" && textureManager.pendingDowloads == 0 || mesh.textureAtlas.length == 1){

                if (mesh.updateTexture) mesh.updateTexture();
                
                if (name !== cachedTexture || j == 0) { //Try to reuse the same texture as much as possible
                  gl.activeTexture(gl.TEXTURE0);
                  gl.bindTexture(gl.TEXTURE_2D, glTexture);
                  gl.uniform1i(shaderManager.shaderProgram.uSampler, 0); 
                  cachedTexture = name;
                }
                
                if (mesh.terrain && mesh.terrain.state == "ready"){
                  gl.uniform1i(shaderManager.shaderProgram.uUseTerrain, true);   
                  gl.activeTexture(gl.TEXTURE2);
                  gl.bindTexture(gl.TEXTURE_2D, mesh.terrain);
                  gl.uniform1i(shaderManager.shaderProgram.uTerrain, 2); 
                } else gl.uniform1i(shaderManager.shaderProgram.uUseTerrain, false);
                
                if (mesh.indexBuffer){
                
                  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
     
                  if (glTexture.blending) 
                    that.setBlending(texture.blending);
                  else if (that.glTexture !== camera.blending)
                    that.setBlending(camera.blending);
                  
                  var count = (mesh.textureAtlas && mesh.textureAtlas[j].count) ? mesh.textureAtlas[j].count : mesh.size;
                  var offset = (mesh.textureAtlas && mesh.textureAtlas[j].offset) ? mesh.textureAtlas[j].offset << 1 : 0;
                  
                  that.lighting(mtl); //Set mtl and linghting properties before drawing
                  
                  gl.drawElements(camera.MODE, count, gl.UNSIGNED_SHORT, offset);                
                
                } else { 
                
                  gl.drawArrays(camera.MODE, 0, mesh.size);
                  
                }  
              }
            } 
          } else {
            if (mesh.terrain && mesh.terrain.state == "ready"){
                gl.uniform1i(shaderManager.shaderProgram.uUseTerrain, true);   
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, mesh.terrain);
                gl.uniform1i(shaderManager.shaderProgram.uTerrain, 2); 
             } else gl.uniform1i(shaderManager.shaderProgram.uUseTerrain, false);
            if (mesh.indexBuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
            gl.uniform1i(shaderManager.shaderProgram.uUseLighting, false);
            gl.uniform1i(shaderManager.shaderProgram.uUseTextureAtlas, false);
            gl.drawElements(camera.MODE, mesh.size, gl.UNSIGNED_SHORT, 0);   
          }
        }
        that.mvPopMatrix();
      }
    };

    return rendererManager;
};