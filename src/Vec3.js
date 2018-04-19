var Engine = Engine || {};

'use strict';

Engine.prototype.Vec3 = function () {
  var Vec3 = {};
  
  
  Vec3.create = function (vec) {
    var dest = new Float32Array(3);
    if (vec) {
      dest[0] = vec[0];
      dest[1] = vec[1];
      dest[2] = vec[2];
    }
    return dest;
  };
  
  Vec3.add = function () {
  };
  
  Vec3.lerp = function (vec, vec2, lerp, dest) {
    var dest = (dest) ? dest : new Array(3);

    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

    return dest;
  };
  
  Vec3.mat4Mul = function(vec, mat, dest){
    var  a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23;
    var lx = vec[0];
    var ly = vec[1];
    var lz = vec[2];
    
    if (!dest) dest = vec;
    
    a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
    a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
    a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];
    a30 = mat[12]; a31 = mat[13]; a32 = mat[14]; a33 = mat[15];

    dest[0] = a00 * lx + a10 * ly + a20 * lz + a30;
    dest[1] = a01 * lx + a11 * ly + a21 * lz + a31;
    dest[2] = a02 * lx + a12 * ly + a22 * lz + a32;
    
    return dest;
  };
  
  Vec3.normalize = function (vec, dest) {
    if (!dest) dest = vec;
    var x = vec[0];
    var y = vec[1];
    var z = vec[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    if (!len) {
      dest[0] = dest[1] = dest[2] = 0;
      return dest;
    } else if(len === 1){
      dest[0] = x;
      dest[1] = y;
      dest[2] = z;
      return dest;
    }
    len = 1/len;
    dest[0] = len * x;
    dest[1] = len * y;
    dest[2] = len * z;
    
    return dest;
  };
  
  Vec3.scale = function (vec, val, dest) {
    if (!dest || vec === dest) {
      vec[0] *= val;
      vec[1] *= val;
      vec[2] *= val;
      return vec;
    }

    dest[0] = vec[0] * val;
    dest[1] = vec[1] * val;
    dest[2] = vec[2] * val;
    return dest;
  };
  
  Vec3.dotProd = function (vec, dest) {
    return vec[0]*dest[0] + vec[1]*dest[1] * vec[2]*dest[2];
  };
  
  Vec3.crossProd = function (vec, dest) {
    var x = vec[1] * dest[2] - vec[2] * dest[1];
    var y = vec[2] * dest[0] - vec[0] * dest[2];
    var z = vec[0] * dest[1] - vec[1] * dest[0];
    return [x,y,z];
  };
  
  Vec3.rotate = function(vector, angle) {
    var x = this.x - vector[0];
    var y = this.y - vector[1];
    var z = this.z - vector[2];

    var x_prime = vector[0] + ((x * Math.cos(angle)) - (y * Math.sin(angle)));
    var y_prime = vector[1] + ((x * Math.sin(angle)) + (y * Math.cos(angle)));
    var z_prime = this.crossProd(x_prime, y_prime);

    return [x_prime, y_prime, z_prime];
  };

  return Vec3;
};