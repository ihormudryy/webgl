var engine = engine || {};

'use strict';

engine.prototype.GUI = function () {
  var gui = new dat.GUI();
  
  gui.addcamera = function (camera) {
    var that = this;
    var f1 = that.addFolder('Camera Controls');
    
    f1.add(camera, 'factor', 0, 180, 1);
    f1.add(camera, 'fov', 0, 180, 1);
    f1.add(camera, 'blending', true, false);
    f1.add(camera, 'SRC_ALPHA', 0, 6, .01);
    f1.add(camera.pos, "x", -100, 100, 0.1).listen();
    f1.add(camera.pos, "y", -100, 100, 0.1).listen();
    f1.add(camera.pos, "z", -300, 300, 0.1).listen();
    f1.add(camera, 'tilt', -360, 360, 1).listen();
    f1.add(camera, 'roll', -360, 360, 1).listen();
    f1.add(camera, 'heading', -360, 360, 1).listen();
    
    var f2 = that.addFolder('Lighting Controls');
    f2.add(camera, 'useLighting', true, false);
    f2.add(camera, 'useSpecularMap', true, false);
    f2.add(camera, 'materialShininess', 0, 255, 1);
    f2.add(camera.lightDirection, 'lightDirectionX', -200, 200, .1);
    f2.add(camera.lightDirection, 'lightDirectionY', -200, 200, .1);
    f2.add(camera.lightDirection, 'lightDirectionZ', -200, 200, .1);
    f2.addColor(camera, 'ambientColor');
    f2.addColor(camera, 'specularColor');
    f2.addColor(camera, 'pointLightingDiffuse');

    that.add(camera, 'MODE', { 
      "POINTS": 0, 
      "LINE_STRIP": 1, 
      "LINE_LOOP": 2, 
      "LINES": 3, 
      "TRIANGLE_STRIP": 4, 
      "TRIANGLE_FAN": 5, 
      "TRIANGLES": 6
    });
    that.add(camera, 'showTextureMap', true, false);
    that.addColor(camera, 'bgColor');

    that.name = 'Advanced properties';
    //that.close();
  };

  return gui;
};