var engine = engine || {};

'use strict';

engine.prototype.ControlManager = function () {
  var controlManager = {};

  controlManager.bindCameraControls = function (engine) { 
    var camera = engine.camera;
    var canvas = document.getElementById('webgl');
    var shift = false;
    var original = true;
    
    canvas.addEventListener('mousewheel', function(evt){
      camera.setZ(evt.wheelDelta * .01);
    }, false); 
    
    var mousedown = false;
    
    canvas.addEventListener('mousemove', function(evt){
      if(evt.button==0 && mousedown){
        if (original){
          if (evt.webkitMovementX)
            camera.set('heading', (evt.webkitMovementX + evt.webkitMovementY)/2);
          else if (evt.mozMovementX)
            camera.set('heading', (evt.mozMovementX + evt.mozMovementY)/2);
          
          if (evt.webkitMovementY)
            camera.set('tilt', evt.webkitMovementY);
          else if (evt.mozMovementX)
            camera.set('tilt', evt.mozMovementY);
        } else {
          if (shift){
            if (evt.webkitMovementX)
              camera.set('heading', (evt.webkitMovementX + evt.webkitMovementY)/2);
            else if (evt.mozMovementX)
              camera.set('heading', (evt.mozMovementX + evt.mozMovementY)/2);
          } else {
            if (evt.webkitMovementX)
              camera.set('roll', evt.webkitMovementX);
            else if (evt.mozMovementX)
              camera.set('roll', evt.mozMovementX);
            
            if (evt.webkitMovementY)
              camera.set('tilt', evt.webkitMovementY);
            else if (evt.mozMovementX)
              camera.set('tilt', evt.mozMovementY);
          }
        }
      } else if(evt.button==2 && mousedown){
        if (evt.webkitMovementX)
          camera.setPosition('x', .01 * evt.webkitMovementX);
        else if (evt.mozMovementX)
          camera.setPosition('x', .01 * evt.mozMovementX);
          
        if (evt.webkitMovementY)
          camera.setPosition('y', -.01 * evt.webkitMovementY);
        else if (evt.mozMovementY)
          camera.setPosition('y', -.01 * evt.mozMovementY);
      }
    });
    
    canvas.addEventListener('mousedown', function(evt){
      if(evt.button==0){
        mousedown = true;
      }
      if(evt.button==2){
        mousedown = true;
        return false;    
      }  
    });
    
    canvas.addEventListener('mouseup', function(evt){
      if(evt.button==0){
        mousedown = false;
      }
      if(evt.button==2){
        mousedown = false;
        return false;    
      }  
    });
    
    canvas.addEventListener('contextmenu', function(){return false;});
    
    /* Add keyboard event listners */
    document.addEventListener('keydown', function(evt){        
      if (evt.keyCode === 16)
        shift = true;
      if (evt.keyCode === 32)
        original = !original;
        
      if (evt.keyCode === 37)
        camera.set('roll', 1);
      if (evt.keyCode === 39)
        camera.set('roll', -1);
      if (evt.keyCode === 38)
        camera.set('tilt', 1);
      if (evt.keyCode === 40)
        camera.set('tilt', -1);
      if (evt.keyCode === 190)
        camera.set('heading', -1);
      if (evt.keyCode === 191)
        camera.set('heading', 1);
    });   
    
    document.addEventListener('keyup', function(evt){
      if (evt.keyCode === 16)
        shift = false; 
    });
    
    var submit = document.getElementById('select_button');
    submit.addEventListener('click', function(){
      if (engine.dataManager.video)
        engine.dataManager.video.src = "";
      engine.dataManager.selectModel(function(args){
        engine.rendererManager.remove();
        engine.rendererManager.add(args); 
      });
    }, false);
    
    var gameMode = document.getElementById('game_mode');
    gameMode.addEventListener('click', function(){
      engine.rendererManager.mvMatrixInit();
      engine.physic.setGameMode();
      engine.rendererManager.start();
    }, false);
    
    var freeCamMode = document.getElementById('free_camera');
    freeCamMode.addEventListener('click', function(){
      engine.rendererManager.mvMatrixInit();
      engine.rendererManager.remove();
      engine.physic.setFreeCameraMode();
    }, false);
    
    window.onresize = function(){
      engine.shaderManager.gl.viewportWidth = window.innerWidth;
      engine.shaderManager.gl.viewportHeight = window.innerHeight;
      engine.shaderManager.gl.canvas.setAttribute('width', window.innerWidth + 'px;');
      engine.shaderManager.gl.canvas.setAttribute('height', window.innerHeight + 'px;');
    }
  };
  
  controlManager.completeSelectList = function(list){
    var select = document.getElementById('selection');
    for (var i in list){
      var name = list[i].split('/');
      var index = name.length - 1;
      var option = document.createElement('option');
      option.value = name[index];
      option.innerHTML = name[index];
      if (i == 0) option.selected = true;
      select.appendChild(option);
    }        
  }
  
  controlManager.bindObjectControls = function(rotation, movement){
    document.addEventListener('keydown', function(evt){
      /*
      if (evt.keyCode === 37)
        rotation[1] -= 1;
      if (evt.keyCode === 39)
        rotation[1] += 1;
      if (evt.keyCode === 38)
        rotation[0] -= 1;
      if (evt.keyCode === 40)
        rotation[0] += 1;
      if (evt.keyCode === 190)
        rotation[2] -= 1;
      if (evt.keyCode === 191)
        rotation[2] += 1;
      */
        
      if (evt.keyCode === 81)
        movement[2] -= 1;
      if (evt.keyCode === 65)
        movement[2] += 1;
      if (evt.keyCode === 87)
        movement[1] -= 1;
      if (evt.keyCode === 83)
        movement[1] += 1;
      if (evt.keyCode === 69)
        movement[0] -= 1;
      if (evt.keyCode === 68)
        movement[0] += 1;
       
    });   
    
    document.addEventListener('keyup', function(evt){
    });
  }

  return controlManager;
};