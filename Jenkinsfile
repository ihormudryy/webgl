node('master'){
	sh(script: "python scripts/build.py")
	archiveArtifacts artifacts: "*"
}