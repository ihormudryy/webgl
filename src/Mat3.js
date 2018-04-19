var Engine = Engine || {};

'use strict';

Engine.prototype.Mat3 = function () {

  var Mat3 = {};

  Mat3.create = function (mat) {
    var dest = new Float32Array(9);
    
    if (mat) {
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[8] = mat[8];
    } else {
      dest[0] = 1;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 1;
      dest[5] = 0;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = 1;
    }

    return dest;
  };
  
  Mat3.perspective = function (fovY, aspectRatio, near, far, dest) {
    var top = near * Math.tan(fovY * Math.PI / 360.0),
        right = top * aspectRatio;
    return Mat3.frustum(-right, right, -top, top, near, far, dest);
  };

  Mat3.identity = function (dest) {
    if (!dest) { dest = Mat3.create(); }
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 1;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    return dest;
  };
  
  Mat3.rotate = function (mat, angle, axis, dest) {
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    
    if (!len) return null;
    if (len !== 1){
      len = 1/len;
      x *= len;
      y *= len;
      z *= len;
    }
    
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    var t = 1 - cos;
    
    var b00 = x * x * t + cos;
    var b01 = y * x * t + z * sin;
    var b02 = z * x * t - y * sin;
    var b10 = x * y * t - z * sin;
    var b11 = y * y * t + cos;
    var b12 = z * y * t + x * sin;
    var b20 = x * z * t + y * sin;
    var b21 = y * z * t - x * sin;
    var b22 = z * z * t + cos;
    
    if (!dest){
      dest = mat;
    } 
	
    var a00 = mat[0],
    a01 = mat[1],
    a02 = mat[2],
    a03 = mat[3],
    a10 = mat[4], 
    a11 = mat[5], 
    a12 = mat[6],
    a13 = mat[7],
    a20 = mat[8], 
    a21 = mat[9], 
    a22 = mat[10], 
    a23 = mat[11];
    
    dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
    dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
    dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
    dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

    dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
    dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
    dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
    dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

    dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
    dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
    dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
    dest[11] = a03 * b20 + a13 * b21 + a23 * b22;

    return dest;
  };
  
  Mat3.transpose = function (mat, dest){
    if (!dest || mat === dest) {
      var a01 = mat[1], a02 = mat[2],
          a12 = mat[5];

      mat[1] = mat[3];
      mat[2] = mat[6];
      mat[3] = a01;
      mat[5] = mat[7];
      mat[6] = a02;
      mat[7] = a12;
      return mat;
    }

    dest[0] = mat[0];
    dest[1] = mat[3];
    dest[2] = mat[6];
    dest[3] = mat[1];
    dest[4] = mat[4];
    dest[5] = mat[7];
    dest[6] = mat[2];
    dest[7] = mat[5];
    dest[8] = mat[8];
    return dest;
  };
  
  Mat3.rotFromMat4 = function(mat4, dest){
    var dest = (dest) ? dest : this.create();
    var a00, a01, a02, a10, a11, a12, a20, a21, a22, b01, b11, b21, d, id, src;
    src = mat4;
    a00 = src[0];
    a01 = src[1];
    a02 = src[2];
    a10 = src[4];
    a11 = src[5];
    a12 = src[6];
    a20 = src[8];
    a21 = src[9];
    a22 = src[10];
    b01 = a22 * a11 - a12 * a21;
    b11 = -a22 * a10 + a12 * a20;
    b21 = a21 * a10 - a11 * a20;
    d = a00 * b01 + a01 * b11 + a02 * b21;
    id = 1 / d;
    dest[0] = b01 * id;
    dest[3] = (-a22 * a01 + a02 * a21) * id;
    dest[6] = (a12 * a01 - a02 * a11) * id;
    dest[1] = b11 * id;
    dest[4] = (a22 * a00 - a02 * a20) * id;
    dest[7] = (-a12 * a00 + a02 * a10) * id;
    dest[2] = b21 * id;
    dest[5] = (-a21 * a00 + a01 * a20) * id;
    dest[8] = (a11 * a00 - a01 * a10) * id;
    return dest;
  };
  
  return Mat3;
};