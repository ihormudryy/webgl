node('master'){
    git branch: "master", credentialsId: "github", url: "https://github.com/ihormudryy/webgl"
	sh(script: "python scripts/build.py")
	archiveArtifacts artifacts: "**"
}