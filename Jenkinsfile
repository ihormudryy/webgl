node('master'){
	sh(script: "python script/build.py")
	archiveArtifacts artifacts: "*"
}