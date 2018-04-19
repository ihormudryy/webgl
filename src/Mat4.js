var Engine = Engine || {};

'use strict';

Engine.prototype.Mat4 = function () {

  var Mat4 = {};

  Mat4.create = function (mat) {
    
    var dest = new Float32Array(16);

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
      dest[9] = mat[9];
      dest[10] = mat[10];
      dest[11] = mat[11];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    } else {
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
      dest[10] = 1;
      dest[11] = 0;
      dest[12] = 0;
      dest[13] = 0;
      dest[14] = 0;
      dest[15] = 1;
    }

    return dest;
  };
  
  Mat4.frustum = function (left, right, bottom, top, near, far, dest) {
    if (!dest) { dest = Mat4.create() }
    var rl = (right - left),
        tb = (top - bottom),
        fn = (far - near);
    dest[0] = (near * 2) / rl;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = (near * 2) / tb;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = (right + left) / rl;
    dest[9] = (top + bottom) / tb;
    dest[10] = -(far + near) / fn;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / fn;
    dest[15] = 0;
    return dest;
  };
  
  Mat4._perspective = function (fov, aspectRatio, near, far, dest) {
    var top = near * Math.tan(fov * Math.PI / 360.0),
        right = top * aspectRatio;
    return Mat4.frustum(-right, right, -top, top, near, far, dest);
  }
  
  Mat4.perspective = function (fov, width, height, near, far, dest) {

    var diagonal = Math.sqrt(width*width + height*height),
        ax = diagonal / (Math.tan(fov * Math.PI / 360) * width),
        by = diagonal / (Math.tan(fov * Math.PI / 360) * height);  
        
    if (!dest) { dest = Mat4.create() }
    dest[0] = ax;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = by;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = -(far + near) / (far - near);
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = - far * near * 2 / (far - near);
    dest[15] = 0;
    return dest;

  };

  Mat4.identity = function (dest) {
    if (!dest) { dest = Mat4.create(); }
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
    dest[10] = 1;
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  };

  Mat4.translate = function (mat, vec3, dest){
    var x = vec3[0], y = vec3[1], z = vec3[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (!dest || mat === dest) {
        mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
        mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
        mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
        mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
        return mat;
    }

    a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
    a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
    a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

    dest[0] = a00; dest[1] = a01; dest[2] = a02; dest[3] = a03;
    dest[4] = a10; dest[5] = a11; dest[6] = a12; dest[7] = a13;
    dest[8] = a20; dest[9] = a21; dest[10] = a22; dest[11] = a23;

    dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
    dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
    dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
    dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
  
    return dest;
  };
  
  Mat4.rotate = function (mat, angle, axis, dest) {
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
    } else {
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    };
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
  
  Mat4.set = function (mat, dest){
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
  };
  
  Mat4.toInverseMat3 = function (mat, dest) {
    var a00 = mat[0], a01 = mat[1], a02 = mat[2],
        a10 = mat[4], a11 = mat[5], a12 = mat[6],
        a20 = mat[8], a21 = mat[9], a22 = mat[10],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        d = a00 * b01 + a01 * b11 + a02 * b21,
        id;

    if (!d) { return null; }
    id = 1 / d;

    if (!dest) { dest = new MatrixArray(9); }

    dest[0] = b01 * id;
    dest[1] = (-a22 * a01 + a02 * a21) * id;
    dest[2] = (a12 * a01 - a02 * a11) * id;
    dest[3] = b11 * id;
    dest[4] = (a22 * a00 - a02 * a20) * id;
    dest[5] = (-a12 * a00 + a02 * a10) * id;
    dest[6] = b21 * id;
    dest[7] = (-a21 * a00 + a01 * a20) * id;
    dest[8] = (a11 * a00 - a01 * a10) * id;

    return dest;
  };
  
  Mat4.multiply = function(a, b, dest){
      var dest = (dest) ? dest : this.create();
      
      var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
          a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7],
          a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11],
          a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
      var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3],
          b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7],
          b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11],
          b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
      dest[0] = a0*b0 + a4*b1 + a8*b2 + a12*b3;
      dest[1] = a1*b0 + a5*b1 + a9*b2 + a13*b3;
      dest[2] = a2*b0 + a6*b1 + a10*b2 + a14*b3;
      dest[3] = a3*b0 + a7*b1 + a11*b2 + a15*b3;

      dest[4] = a0*b4 + a4*b5 + a8*b6 + a12*b7;
      dest[5] = a1*b4 + a5*b5 + a9*b6 + a13*b7;
      dest[6] = a2*b4 + a6*b5 + a10*b6 + a14*b7;
      dest[7] = a3*b4 + a7*b5 + a11*b6 + a15*b7;

      dest[8] = a0*b8 + a4*b9 + a8*b10 + a12*b11;
      dest[9] = a1*b8 + a5*b9 + a9*b10 + a13*b11;
      dest[10] = a2*b8 + a6*b9 + a10*b10 + a14*b11;
      dest[11] = a3*b8 + a7*b9 + a11*b10 + a15*b11;

      dest[12] = a0*b12 + a4*b13 + a8*b14 + a12*b15;
      dest[13] = a1*b12 + a5*b13 + a9*b14 + a13*b15;
      dest[14] = a2*b12 + a6*b13 + a10*b14 + a14*b15;
      dest[15] = a3*b12 + a7*b13 + a11*b14 + a15*b15;
      
      return dest;
  };
  
  Mat4.invert = function(a, dest) {
    var that = this;
    var dest = (dest) ? dest : that.create();
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

    // Calculate the determinant
    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    dest[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    dest[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    dest[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    dest[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    dest[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    dest[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    dest[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    dest[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return dest;
  };


  return Mat4;
};