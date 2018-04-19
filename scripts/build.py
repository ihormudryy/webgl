import os, sys, json, re
import shutil
import string
from xml.dom.minidom import parse

def mapBuild():
    destDir = "compiled/src/"
    
    if not os.path.exists(destDir):
        os.makedirs(destDir)

    fullName = 'myEngine.max.js'
    minName = 'myEngine.min.js'
    gzName = 'myEngine.min.gz'

    srcDir = "../src/"

    jsFiles = [
      "Start.js",
      'RendererManager.js',
      "ShaderManager.js",
      "DataManager.js",
      "TextureManager.js",
      "ControlManager.js",
      "BufferManager.js",
      "Vec3.js",
      "Mat4.js",
      "Mat3.js",
      "GUI.js",
      'Camera.js',
      'Physics.js',
      'ObjectControl.js'
    ]

    shaderFiles = [
      "shaders/shadow_map.xml",
      "shaders/shader.xml"      
    ]
    
    array = {}
    for file in shaderFiles:
        dom = parse(realPath(srcDir + file))
        array[file] = {}
        array[file]["fragment"] = dom.getElementsByTagName("fragment")[0].firstChild.data
        array[file]["vertex"] = dom.getElementsByTagName("vertex")[0].firstChild.data

    shaders = json.dumps(array)

    f = open(realPath(destDir + fullName), 'wb')

    copyright = "/**\n\
  * Generic 3D Webgl engine\n\
  *\n\
  * Copyright (C) 2012, Ihor Mudryy\n\
  *\n\
  * All rights reserved\n\
  * These coded instructions, statements, and computer programs contain\n\
  * unpublished proprietary information of Ihor Mudryy, and are copy\n\
  * protected by law.\n\
  * Permission is granted to anyone to use this software for any purpose,\n\
  * including commercial applications, and to alter it and redistribute it \n\
  * freely without any restrictions\n\
*/\n"
    
    text = ""
    for file in jsFiles:
        print file
        tmp = open(realPath(srcDir + file), 'rb')
        text = text + tmp.read() + "\n"

    f.write( re.sub(r'(?s)\/\*REPLACESHADER\*\/.+\/\*/\REPLACESHADER\*\/',
           "var globalShaders = "+ shaders.replace("\\n", "\\\\n") +";\nfunction requestShader(url) {\n\turl = url.replace(\"shaders/\", \"\"); return globalShaders[url];\n}",
           copyright + text) )

    f.close()
    
    os.system('java -jar "' + realPath('yuicompressor.jar') + '" --type=js "' + realPath(destDir + fullName) + '" -o "' + realPath(destDir  + minName) + '"')
    
    min = open(realPath(destDir + minName), 'rb')
    min_text = copyright + min.read()
    min.close()
    min = open(realPath(destDir + minName), 'wb')
    min.write(min_text)
    min.close()
    shutil.copy2(realPath(srcDir + 'shaders/shader.xml'), realPath(destDir + 'shaders/shader.xml'))
    shutil.copy2(realPath(srcDir + 'shaders/shadow_map.xml'), realPath(destDir + 'shaders/shadow_map.xml'))
    print "Successfully compiled"
    
def realPath(file):
    i = len(os.path.split(sys.argv[0])[-1:][0])
    return os.path.realpath(os.path.join(os.getcwd(), sys.argv[0][:-i], file))
    
mapBuild()