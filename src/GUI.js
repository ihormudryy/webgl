var Engine = Engine || {};

'use strict';

Engine.prototype.GUI = function () {

  function gui(){
    var that = this;
    that.folders = {};
    that.gui = new dat.GUI();
  }
  
  gui.prototype.addFolder = function (name, position, properties) {
    var that = this;
    var gui = that.gui;

    var f = gui.addFolder(name);
    that.folders[name] = f;
    for (var name in position){
      that.setProperty(f, position, name);
    }
    for (var name in properties){
      if (name.indexOf('Color') != -1){
        f.addColor(properties, name);
      } else {
        that.setProperty(f, properties, name);
      }
    }
    return f;
  };
  
  gui.prototype.setProperty = function( f, item, name ){
    var that = this;
    if (name.toLowerCase().indexOf('matrix') == -1){
      var obj = item[name];
      var itemToAdd = (obj.val !== undefined) ? obj : item;
      var nameToAdd = (obj.val !== undefined) ? 'val' : name;
      var folder;
      var list = obj.list;
      
      if (list) {
        folder = f.add(itemToAdd, nameToAdd, list);
      } else {
        var val = (obj.val) ? obj.val : 100;
        var min = (obj.min) ? obj.min : -val;
        var max = (obj.max) ? obj.max : val;
        var step = val/(max-min);
        folder = f.add(itemToAdd, nameToAdd, min, max, step).listen();
      }
      
      if (obj.name){
        folder.name(obj.name);
      }
    }
  }

  return new gui();
};