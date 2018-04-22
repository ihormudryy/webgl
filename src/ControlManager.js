var Engine = Engine || {};

'use strict';

Engine.prototype.ControlManager = function () {
  var controlManager = {};

  controlManager.bindCameraControls = function (camera) { 
    var camera = camera;
    var canvas = document.getElementById('webgl');
    var shift = false;
    var original = true;
    
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
    canvas.addEventListener(mousewheelevt, function(evt){
      camera.setZ( (evt.wheelDelta) ? evt.wheelDelta * .01 : -evt.detail );
    }, false); 
    
    var mousedown = false;
    
    canvas.addEventListener('mousemove', function(evt){
      if(evt.button==0 && evt.buttons==1 && mousedown){
        if (original){
          if (evt.movementX)
            camera.set('heading', (evt.movementX + evt.movementY)/2);
          else if (evt.mozMovementX)
            camera.set('heading', (evt.mozMovementX + evt.mozMovementY)/2);
          
          if (evt.movementY)
            camera.set('tilt', evt.movementY);
          else if (evt.mozMovementX)
            camera.set('tilt', evt.mozMovementY);
        } else {
          if (shift){
            if (evt.movementX)
              camera.set('heading', (evt.movementX + evt.movementY)/2);
            else if (evt.mozMovementX)
              camera.set('heading', (evt.mozMovementX + evt.mozMovementY)/2);
          } else {
            if (evt.movementX)
              camera.set('roll', evt.movementX);
            else if (evt.mozMovementX)
              camera.set('roll', evt.mozMovementX);
            
            if (evt.movementY)
              camera.set('tilt', evt.movementY);
            else if (evt.mozMovementX)
              camera.set('tilt', evt.mozMovementY);
          }
        }
      } else if(evt.button==0 && evt.buttons==2 && mousedown){
        if (evt.movementX)
          camera.setPosition('x', .01 * evt.movementX);
        else if (evt.mozMovementX)
          camera.setPosition('x', .01 * evt.mozMovementX);
          
        if (evt.movementY)
          camera.setPosition('y', -.01 * evt.movementY);
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

    window.onresize = function(){
      _engine.shaderManager.gl.viewportWidth = window.innerWidth;
      _engine.shaderManager.gl.viewportHeight = window.innerHeight;
      _engine.shaderManager.gl.canvas.setAttribute('width', window.innerWidth + 'px;');
      _engine.shaderManager.gl.canvas.setAttribute('height', window.innerHeight + 'px;');
    }
  };
  
  var key_down = new Array(256);
  for(var key=0; key<256; key++) key_down[key] = false;
  
  controlManager.bindObjectControls = function(object){
    document.addEventListener('keydown', function(evt){
      if (evt.keyCode >= 0 && evt.keyCode <= 255) key_down[evt.keyCode] = true;
      if (key_down[16]){
        if (key_down[81])
          object.tilt -= 1;
        if (key_down[65])
          object.tilt += 1;
        if (key_down[87])
          object.heading -= 1;
        if (key_down[83])
          object.heading += 1;
        if (key_down[69])
          object.roll -= 1;
        if (key_down[68])
          object.roll += 1;
      } else {
        if (evt.keyCode === 81)
          object.pos.z -= 1;
        if (evt.keyCode === 65)
          object.pos.z += 1;
        if (evt.keyCode === 87)
          object.pos.y -= 1;
        if (evt.keyCode === 83)
          object.pos.y += 1;
        if (evt.keyCode === 69)
          object.pos.x -= 1;
        if (evt.keyCode === 68)
          object.pos.x += 1;
       }
    });   
    
    document.addEventListener('keyup', function(evt){
      if (evt.keyCode >= 0 && evt.keyCode <= 255) key_down[evt.keyCode] = false;
    });
  }

  return controlManager;
};