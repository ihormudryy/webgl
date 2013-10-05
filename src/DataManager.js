var engine = engine || {};

'use strict';

engine.prototype.DataManager = function (_engine) {
  
  var dataManager = {};
  var controlManager = _engine.controlManager;
  var bufferManager = _engine.bufferManager;
  var textureManager = _engine.textureManager;
  var shaderManager = _engine.shaderManager;
  var camera = _engine.camera;
  var physic = _engine.physic;
  
  dataManager.resources = [ 
    "/data/Jets/Su-37_Terminator",
    "/data/Jets/Su-27_Flanker",
    "/data/Jets/Su-32_FN",
    "/data/Jets/Su-34_Fullback",
    "/data/Jets/Su-35_SuperFlanker",
    "/data/Jets/Mig-29_Fulcrum",
    "/data/Jets/Mig-31_Foxhound",
    "/data/Jets/F-4E_Phantom_II",
    "/data/Jets/F-14A_Tomcat",
    "/data/Jets/RF-15_PeakEagle",
    "/data/Jets/F-16C_FightingFalcon",
    "/data/Jets/FA-18C_Hornet",
    "/data/Jets/FA-22_Raptor",
    "/data/Jets/FB-22_StrikeRaptor",
    "/data/Jets/F-35_Lightning_II",
    "/data/Jets/F-117_Nighthawk",
    "/data/Jets/YF-12A",
    "/data/Jets/YF-17_Cobra",
    "/data/Jets/YF-23_BlackWidow_II",
    "/data/Jets/B-2_Spirit",
    "/data/Jets/Eurofighter-2000_Typhoon",
    "/data/Jets/Saab-39_Gripen",
    "/data/Jets/Shuttle"
  ];
  
  dataManager.staticResources = 0;
  
  dataManager.getData = function (src, callback) {
    /* Load data files file using asynchronus requests*/
    var that = this;
    var xmlhttp = new XMLHttpRequest();
    var data = {};
    
    xmlhttp.open("GET", src, false);
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4)
        if (xmlhttp.status == 0 || xmlhttp.status == 200 || xmlhttp.status == 304 || (!xmlhttp.status)){
          if (src.indexOf('.json') !== -1)
            data = JSON.parse(xmlhttp.responseText);
          else if (src.indexOf('.obj') !== -1) {
            var content = xmlhttp.responseText.split('\n');
            data = that.parseObjFile(content,src);
          } else {
            data = xmlhttp.responseText;
          }
          data.state = "ready";
          if (typeof callback === 'function') callback(data);
        } else {
          console.log("Data file not found");
          return null;
        }
    } 
    xmlhttp.send(null);

    return data;
  };
  
  dataManager.parseObjFile = function(objContent, src){
    var that = this;
        indexData = new Array(),
        vertexData = new Array(),
        tempV = new Array(),
        tempVt = new Array(),
        tempVn = new Array(),
        hashVertex = {},
        scale = 1;
    
    var rows = objContent;
    var segments = new Array();
    var mtlLibFile;
    var textures = new Array();
    var lastMlt;
    
    for (var t in rows) {
      var row = rows[t];
      
      if (row.indexOf("mtllib") !== -1) 
        mtlLibFile = row.split(" ")[1]; //Searching for mtl lib file

      if (row.indexOf("usemtl") !== -1) {
        lastMlt = row.split(" ")[1];
        textures.push(lastMlt); //Searching for object particle names
      } else if (parseInt(t)-1 > 0)
        if (rows[parseInt(t)-1][0] === '#' && rows[t][0] === 'f'){
          textures.push(lastMlt);
        }
      
      if (row[0]==='v' && row[1]==='t') {
        var vuv = row.split(' ');
        var s = (vuv[1] !== "") ? 1 : 2;
        tempVt.push(parseFloat(vuv[s])); // push U
        tempVt.push(parseFloat(vuv[s+1])); // push V 
      } else if (row[0]==='v' && row[1]==='n'){
        var vun = row.split(' ');
        var s = (vun[1] !== "") ? 1 : 2;
        tempVn.push(parseFloat(vun[s])); // push normal X
        tempVn.push(parseFloat(vun[s + 1])); // push normal Y
        tempVn.push(parseFloat(vun[s + 2])); // push normal Z
      } else if (row[0]==='v') {
        var vxyz = row.split(' ');
        var s = (vxyz[1] !== "") ? 1 : 2;
        tempV.push(parseFloat(vxyz[s])*scale); // push X
        tempV.push(parseFloat(vxyz[s + 1])*scale); // push Y
        tempV.push(parseFloat(vxyz[s + 2])*scale); // push Z
      }
    }
    
    var vertexCount = 0;
    var offset = 0;
    var fistV = (tempVn.length > 0) ? 2 : 1;
    var lastV = (tempVn.length > 0) ? 4 : 3;
    
    for (var t in rows) {
      if (rows[t][0] === 'f') {
        var indices = rows[t].split(' ');
        for(var k = 0; k < indices.length; k++) {
          fistV = (indices[1] != "") ? 1 : 2;
          lastV = (indices[1] != "") ? indices.length - 1 : indices.length - 2;
          var key = indices[k];
          if (key !== "" && key !== "f"){
            var vertexIndex = vertexCount;
            if (hashVertex[key] === undefined) {
              hashVertex[key] = vertexCount;
              var index = key.split('/');
              var v_index = Math.abs(parseInt(index[0] - 1) * 3);
              vertexData.push(tempV[v_index]);
              vertexData.push(tempV[v_index + 1]);
              vertexData.push(tempV[v_index + 2]);
              if (tempVt.length > 0){
                var vt_index = Math.abs(parseInt(index[1] -1 ) * 2);
                vertexData.push(tempVt[vt_index]);
                vertexData.push(tempVt[vt_index + 1]);
              }
              if (tempVn.length > 0){
                var vn_Index = Math.abs(parseInt(index[2] - 1) * 3);
                vertexData.push(tempVn[vn_Index]);
                vertexData.push(tempVn[vn_Index + 1]);
                vertexData.push(tempVn[vn_Index + 2]);
              }
              vertexCount++;
            } else {
              vertexIndex = hashVertex[key];
            }
            indexData.push(vertexIndex); 
            
            ++offset;
            var prev = rows[parseInt(t) - 1][0];
            if (prev !== 'f' && prev !== 's' && rows[t][0] === 'f' && k == fistV){
              segments.push({offset: indexData.length - 1});
            }
            
            var next = rows[parseInt(t) + 1][0];
            if (next !== 'f' && rows[t][0] === 'f' && k == lastV){
              segments[segments.length-1].count = indexData.length + 1 - segments[segments.length-1].offset;  
              offset = 0;
            } 
          }
        }
      }
    }
    
    var format = 'XYZ';
    if (tempVt.length > 0) format += "UV";
    if (tempVn.length > 0) format += 'N';   
    
    var mtlObject;
    if (mtlLibFile)
      mtlObject = that.parseMtlFile(mtlLibFile, src);
    
    if (segments.length == textures.length){
      for (var jj in segments){
        segments[jj].textureName = textures[jj];
      }
    } else {
      console.error('Error in parsing OBJ file');
      return null;
    }
    
    return {
      vertices: vertexData, 
      indices: indexData, 
      vertexFormat: format, 
      textureAtlas: segments,
      mtlContent: mtlObject
    };
  }
  
  dataManager.parseMtlFile = function(mtlPath, srcUrl){
    var that = this,
        mtl = {};
    
    mtl._folder = "/";    
    var tmpArr = srcUrl.split('/');
    for (var ii = 1; ii < tmpArr.length - 1; ii++)
      mtl._folder += tmpArr[ii] + "/";
      
    var firstElement = true;
    that.getData(mtl._folder + mtlPath, function(responseText){
      var objectParticles = responseText.split("newmtl");
      for (var i in objectParticles){
        if (objectParticles[i].indexOf("#") === -1){ //This condition is for filteiring out license quotes
          var properties = objectParticles[i].split("\n");
          var tempMtl = {};
          for (var p = 0; p < properties.length; p++){
            
            var field = properties[p].split(' ');
            if (field[1] !== undefined){
              var propName;
              if (field[0] === "" && field[1] !== "")
                propName = "newmtl";
              else 
                propName = field[0];
              
              var propsArray = new Array();
              var singleProperty = new Array();
              if (field.length > 2){
                for (var val = 1; val <field.length; val++)
                  propsArray.push(field[val]);
              } else
                singleProperty = field[1];
                
              tempMtl[propName] = (propsArray.length == 0) ? singleProperty : propsArray;
            }
          }
          if (firstElement){
            tempMtl.defTexture = true;
            firstElement = false;
          }
          mtl[tempMtl.newmtl] = tempMtl;
        }
      }      
    })
    return mtl;
  }
  
  dataManager.loadDataAndInitBuffers = function(obj, _callback){
    var bufferPool = {};
    
    this.getData(obj, function (mesh){
      if (mesh.vertices) {
        bufferPool.vertexBuffer = bufferManager.initBuffer(mesh.vertices);
      }
      
      if (mesh.indices) {
        bufferPool.indexBuffer = bufferManager.initIndexBuffer(mesh.indices);
        bufferPool.size = mesh.indices.length;
      }
      
      if (mesh.texture) bufferPool.textureBuffer = bufferManager.initBuffer(mesh.texture);
      
      if (mesh.normals) bufferPool.normalsBuffer = bufferManager.initBuffer(mesh.normals);
      
      bufferPool.vertexFormat = mesh.vertexFormat;
      
      bufferPool.vertex_stride = 0;
      if (mesh.vertexFormat === 'XYZUV') {
        bufferPool.vertex_stride = 20;
      } else if (mesh.vertexFormat === 'XYZUVN') {
        bufferPool.vertex_stride = 32;
      } else if (mesh.vertexFormat === 'XYZN') {
        bufferPool.vertex_stride = 24;
      }
      
      function onDownloadDone (){
        if (typeof _callback == 'function') _callback(bufferPool);
      }
      
      /* Load texture images and initialize the texture buffer */
      bufferPool.mtl = mesh.mtlContent;    
      bufferPool.texture = {};
      if (bufferPool.mtl){
        var cachedPath;
        for (var j in bufferPool.mtl){ 
          if (bufferPool.mtl[j]["map_Kd"]){
            var path = bufferPool.mtl._folder + bufferPool.mtl[j]["map_Kd"]; //Fetch texture name from mlt object
            var name = bufferPool.mtl[j]["newmtl"]; //Add new object with corresponding mlt name
            if (bufferPool.mtl[j]["map_Kd"].length == 1)
              path = cachedPath;
            else 
              cachedPath = path;
            bufferPool.texture[name] = textureManager.createTexture(path, onDownloadDone);
          } else if (bufferPool.mtl[j]["newmtl"]){
            var name = bufferPool.mtl[j]["newmtl"]; 
            bufferPool.texture[name] = textureManager.createTexture(cachedPath, onDownloadDone);
          }
          if (bufferPool.mtl[j]["map_bump"]){
            var path = bufferPool.mtl._folder + bufferPool.mtl[j]["map_bump"]; //Fetch texture name from mlt object
            var name = bufferPool.mtl[j]["map_bump"]; //Add new object with corresponding mlt name
            if (bufferPool.mtl[j]["map_bump"].length !== 1){
              bufferPool.mtl[j].bump_map_texture = textureManager.createTexture(path, onDownloadDone);
            }
          }
        }
      }

      /* Binding together textures with 3D object pieces */
      bufferPool.textureAtlas = mesh.textureAtlas;
      for(var ii in bufferPool.textureAtlas){  
        var tName = bufferPool.textureAtlas[ii].textureName;
        bufferPool.textureAtlas[ii].gl_Texture = bufferPool.texture[tName];
        bufferPool.textureAtlas[ii].mtl = bufferPool.mtl[tName];
      }
      
      delete bufferPool.mtl._folder;
      
      bufferPool.state = "ready";
    });  
    
    return bufferPool;
  };
  
  dataManager.generateSurface = function(zDepth){
    var z = (zDepth !== undefined) ? zDepth : 0;
    var length = 110;
    var coeficient = 2;
    var indexMat = {};
    var vertexArray = new Array();
    var textureArray = new Array();
    var indexArray = new Array();
    
    index = 0;
    for (var y = 0; y <= length; y++){
      for (var x = 0; x <= length; x++){
        vertexArray.push( coeficient * x );
        vertexArray.push( coeficient * y );
        vertexArray.push( 0 );

        textureArray.push(x / length); 
        textureArray.push(y / length);
      }
    };
    
    for (var y = 0; y < length; y++){
      for (var x = 0; x < length; x++){

        var i0 = y * ( length + 1 ) + x;
        var i1 = i0 + length + 1;
        var i2 = i0 + 1;
        var i3 = i1 + 1;
        
        indexArray.push(i0);
        indexArray.push(i2);
        indexArray.push(i1);

        indexArray.push(i1);
        indexArray.push(i2);
        indexArray.push(i3);
      }
    }
    

    
    /*                        
    
    var texture_mat = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 1.0 ];
    var vertex_mat = [ 
      -1.0, -1.0,
       1.0, -1.0,
       1.0,  1.0,
      -1.0,  1.0,
      -1.0, -1.0,
       1.0,  1.0 ];
       
      
    var vertexArray = new Array();
    var textureArray = new Array();
    
    for (var y = 0; y <= length; y++){
      for (var x = 0; x <= length; x++){
        for (var i = 0; i < vertex_mat.length; i += 2){
          var _x_coord = vertex_mat[ i ] + x - half_length;
          var _y_coord = vertex_mat[ i + 1 ] + y - half_length;
          vertexArray.push(coeficient * _x_coord);
          vertexArray.push(coeficient * _y_coord);
          vertexArray.push(0);
        }
      }
    };
  
    for (var ii = 0; ii < vertexArray.length/18; ii++){
      for (var qq = 0; qq < texture_mat.length; qq++)
        textureArray.push(texture_mat[qq]);
    }  */
    
    var bufferPool = {};
    bufferPool.vertexBuffer = bufferManager.initBuffer(vertexArray);
    bufferPool.textureBuffer = bufferManager.initBuffer(textureArray);
    //bufferPool.normalsBuffer = bufferManager.initBuffer(vertexArray); // Will fix later
    bufferPool.indexBuffer = bufferManager.initIndexBuffer(indexArray);
    bufferPool.size = indexArray.length;
    
    bufferPool.textureAtlas = new Array();
    bufferPool.textureAtlas[0] = {};
    bufferPool.textureAtlas[0].gl_Texture = textureManager.createTexture("/data/ground.jpg");
    
    bufferPool.terrain = textureManager.createTexture("data/Heightmap.png");
    
    this.staticResources++;
    
    bufferPool.state = "ready";
    
    return bufferPool;    
  };
  
  dataManager.generateCube = function(){
    var z = -30;
    var length = 20;
    var coeficient = 2;
    
    var vertex_mat = [ 
      -1.0, -1.0,
       1.0, -1.0,
       1.0,  1.0,
      -1.0,  1.0,
      -1.0, -1.0,
       1.0,  1.0 ];
      
    var vertexArray = new Array();
    var normalArray = new Array();
    //Bottom
    for (var y = 0; y < length; y++){
      for (var x = 0; x < length; x++){
        for (var i = 0; i < vertex_mat.length; i+=2){
          var _x_coord = vertex_mat[i]+2*x - length;
          var _y_coord = vertex_mat[i+1]+2*y - length;
          vertexArray.push(coeficient * _x_coord);
          vertexArray.push(coeficient * _y_coord);
          vertexArray.push(z);
        }
        
      }
    };
    //Left
    for (var y = 0; y <= length; y++){
      for (var _z = coeficient; _z <= length; _z++){
        for (var i = 0; i < vertex_mat.length; i+=2){
          var _z_coord = vertex_mat[i]+2*_z + z + length/ coeficient + 2;
          var _y_coord = vertex_mat[i+1]+2*y - length;
          vertexArray.push(-length * coeficient - 2);
          vertexArray.push(coeficient * _y_coord);
          vertexArray.push(coeficient * _z_coord);
        }
      }
    }
    //Right
    for (var y = 0; y <= length; y++){
      for (var _z = coeficient; _z <= length; _z++){
        for (var i = 0; i < vertex_mat.length; i+=2){
          var _z_coord = vertex_mat[i+1]+2*_z + z + length/ coeficient + 2;
          var _y_coord = vertex_mat[i]+2*y - length;
          vertexArray.push(length * coeficient + 2);
          vertexArray.push(coeficient * _y_coord);
          vertexArray.push(coeficient * _z_coord);
        }
      }
    }

    //Front
    for (var x = 0; x <= length; x++){
      for (var _z = coeficient; _z <= length; _z++){
        for (var i = 0; i < vertex_mat.length; i+=2){
          var _z_coord = vertex_mat[i+1]+2*_z + z + length/ coeficient + 2;
          var _x_coord = vertex_mat[i]+2*x - length;
          vertexArray.push(_x_coord * coeficient);
          vertexArray.push(length * coeficient + 2);
          vertexArray.push(coeficient * _z_coord);
        }
      }
    }   
    
    //Rear
    for (var x = 0; x <= length; x++){
      for (var _z = coeficient; _z <= length; _z++){
        for (var i = 0; i < vertex_mat.length; i+=2){
          var _z_coord = vertex_mat[i+1]+2*_z + z + length/ coeficient + 2;
          var _x_coord = vertex_mat[i]+2*x - length;
          vertexArray.push(_x_coord * coeficient);
          vertexArray.push(-length * coeficient - 2);
          vertexArray.push(coeficient * _z_coord);
        }
      }
    }
    //Top
    for (var y = 0; y <= length; y++){
      for (var x = 0; x <= length; x++){
        for (var i = 0; i < vertex_mat.length; i+=2){
          var _x_coord = vertex_mat[i]+2*x - length;
          var _y_coord = vertex_mat[i+1]+2*y - length;
          vertexArray.push(coeficient * _x_coord);
          vertexArray.push(coeficient * _y_coord);
          vertexArray.push(-z + length - coeficient * 2);
        }
        
      }
    };
    var bufferPool = {};
    bufferPool.vertexBuffer = bufferManager.initBuffer(vertexArray);
    bufferPool.size = vertexArray.length / 3;
    bufferPool.normalsBuffer = bufferManager.initBuffer(vertexArray);
    
    this.staticResources++;
    
    bufferPool.state = "ready";
    
    return bufferPool; 
  }
  
  dataManager.generateSky = function(radius){
    var latitudeBands = 10;
    var longitudeBands = 10;
    var radius = (radius) ? radius : 200;
    
    var vertexArray = new Array();
    var indexArray = new Array();
    var textureArray = new Array();
    var normalArray = new Array();

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      var theta = [];
      var sinTheta = [];
      var cosTheta = [];
      
      for (var i = 1; i>=0; i--){
        theta[i] = (latNumber + i) * Math.PI / latitudeBands;
        sinTheta.push(Math.sin(theta[i]));
        cosTheta.push(Math.cos(theta[i]));
      };
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var fi = [];
        var sinFi = [];
        var cosFi = [];
        
        for (var j = 1; j>=0; j--){
          fi[j] = (longNumber + j) * Math.PI / longitudeBands;
          sinFi.push(Math.sin(fi[j]));
          cosFi.push(Math.cos(fi[j]));
        };
        
        var x = new Array();
        var y = new Array();
        var z = new Array();
        var v = new Array();
        var u = new Array();
        for (var s = 0; s<2; s++){
          for (var q = 0; q < 2; q++){
            x.push(radius * cosFi[q] * sinTheta[s]);
            z.push(radius * sinFi[q] * sinTheta[s] - 2);
          }
          y.push(radius * cosTheta[s]);
        }
        vertexArray.push(x[0], -y[0], z[0]);//1
        vertexArray.push(x[1], -y[0], z[1]);//2
        vertexArray.push(x[3], -y[1], z[3]);//3
        vertexArray.push(x[2], -y[1], z[2]);//4
        vertexArray.push(x[0], -y[0], z[0]);//1
        vertexArray.push(x[3], -y[1], z[3]);//3
      }
    }
    var texture_mat = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0 
      ];
      
    for (var ii = 0; ii < vertexArray.length/18; ii++){
      for (var qq = 0; qq < texture_mat.length; qq++)
        textureArray.push(texture_mat[qq]);
    }

    var bufferPool = {};
    bufferPool.vertexBuffer = bufferManager.initBuffer(vertexArray);
    bufferPool.size = vertexArray.length / 3;
    bufferPool.textureBuffer = bufferManager.initBuffer(textureArray);
    bufferPool.normalsBuffer = bufferManager.initBuffer(vertexArray); // Will fix later
    
    bufferPool.textureAtlas = new Array();
    bufferPool.textureAtlas[0] = {};
    bufferPool.textureAtlas[0].gl_Texture = textureManager.createTexture("/data/sky.jpg");
    
    this.staticResources++;
    
    bufferPool.status = "ready";
    
    return bufferPool;  
  }
  
  dataManager.checkLoaderVisibility = function(){
    var that = this;
    if (that.loaderVisibility && textureManager.pendingDowloads == 0){
      document.getElementById('loading').style.visibility = "hidden";
      that.loaderVisibility = false;
    }
  }
  
  dataManager.selectModel = function(_callback){
    var that = this; 
    var selectList = document.getElementById('selection');
    
    document.getElementById('loading').style.visibility = "visible";
    that.loaderVisibility = true;
    
    for (var item = 0; item < selectList.options.length; item++){ 
      if (selectList.options[item].selected){
        for(var i in that.resources){
          if (that.resources[i].indexOf(selectList.options[item].value) !== -1){ 
            var relativePath = that.resources[i] + '/' + selectList.options[item].value + '.obj';
            that.loadDataAndInitBuffers(relativePath, function(object3D){
              object3D.rotate = physic.rotateInCameraSpace;
              object3D.move = physic.moveInCameraSpace;
              controlManager.bindObjectControls(object3D.rotate, object3D.move);
              
              if (typeof _callback == 'function') _callback.call(that, object3D); 
            })
          }
        }
      }
    }
  }
  
  dataManager.addVideo = function(){
    var videoElement = document.getElementById("video");
    var intervalID;
    
    var vertex_mat = [ 
     -18.0,  41.0, 1.0, //2
      18.0,  41.0, 1.0, //3
      18.0,  41.0, 20.0, //0
     -18.0,  41.0, 20.0 ]; //1
    var texture_mat = [
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0 ];
    var vert_normals = [
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
    ];
    var indeces_mat = [
      0,  1,  2,     
      0,  2,  3 ];

    var bufferPool = {};
    bufferPool.vertexBuffer = bufferManager.initBuffer(vertex_mat);
    bufferPool.indexBuffer = bufferManager.initIndexBuffer(indeces_mat);
    bufferPool.size = indeces_mat.length;
    bufferPool.textureBuffer = bufferManager.initBuffer(texture_mat);
    bufferPool.normalsBuffer = bufferManager.initBuffer(vert_normals); // Will fix later
   /* bufferPool.textureAtlas = new Array();
    bufferPool.textureAtlas[0] = {};
    bufferPool.textureAtlas[0].gl_Texture = textureManager.createTexture("/data/ground.jpg");
    */
    var gl = shaderManager.gl;
    var cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    bufferPool.textureAtlas = new Array();
    bufferPool.textureAtlas[0] = {};
    bufferPool.textureAtlas[0].gl_Texture = cubeTexture;
    bufferPool.textureAtlas[0].video = videoElement;
    this.video = videoElement;
    function startVideo() {
      cubeTexture.state = "ready";
      videoElement.play();
    }
    
    bufferPool.updateTexture = function() {
      gl.bindTexture(gl.TEXTURE_2D, bufferPool.textureAtlas[0].gl_Texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    videoElement.addEventListener("canplaythrough", startVideo, false);
    videoElement.addEventListener("ended", startVideo, true);
    videoElement.src = "data/CCCP-Su-37-Terminator.mp4";
    
    this.staticResources++;
    bufferPool.state = "ready";
        
    return bufferPool;    
  }
  
  return dataManager;
};