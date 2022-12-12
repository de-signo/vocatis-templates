
pipeline {
  agent any

  parameters {
    booleanParam(name: 'clean', defaultValue: true, description: 'Clean before build')
    booleanParam(name: 'check', defaultValue: true, description: 'Check package-lock.json')
    string(name: 'notifyEmail', defaultValue: "michael.stoll@de-signo.de", description: 'E-Mail Adresses to notify about build result')
    string(name: 'notifyEmailSuccess', defaultValue: "carmen.thomas@de-signo.de", description: 'E-Mail Adresses to notify about successfull build result')
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
  }

  stages {
    stage('prep') {
      steps {
        // Initialize params as envvars, workaround for bug https://issues.jenkins-ci.org/browse/JENKINS-41929
        script { params.each { k, v -> env[k] = v } }

        bat 'ng --version'

        script {
          currentBuild.description = bat(returnStdout: true, script:"@git describe --tags --dirty").trim()
        }
      }
    }

    stage('clean') {
      when {
        equals expected: true, actual: clean.toBoolean()
      }
      steps {
        bat 'git clean -ffdx'
      }
    }

    stage('install') {
      steps {
        bat 'npm install'
      }
    }

    stage('check') {
      when {
        equals expected: true, actual: check.toBoolean()
      }
      steps {
        bat 'git diff --exit-code'
      }
    }

    stage('test-display') {
      steps {
        dir('5.0') {
          dir('display') {
            bat 'ng test --karma-config karma.conf.srv.js'
          }
        }
      }
    }

    stage('gulp') {
      steps {
        dir('5.0') {
          bat 'npx gulp'
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts allowEmptyArchive: true, artifacts: 'dist/**/*', followSymlinks: false, onlyIfSuccessful: true

      script {
        receipients = notifyEmail;
        if (currentBuild.result == 'SUCCESS') {
          receipients += ";$notifyEmailSuccess"
        }
      }

      emailext to: "$receipients",
                recipientProviders: [developers(), requestor(), culprits()],
                subject: "Build: ${currentBuild.currentResult}: ${env.JOB_NAME} (${currentBuild.description})",
                body: '''${JELLY_SCRIPT, template="html"}''',
                mimeType: 'text/html',
                attachLog: true,
                attachmentsPattern: 'dist/**/*',
                presendScript: '''
                  recipients = msg.getRecipients(jakarta.mail.Message.RecipientType.TO)
                  filtered = recipients.findAll { addr -> addr.toString().contains('@de-signo.de') }
                  msg.setRecipients(jakarta.mail.Message.RecipientType.TO, filtered as jakarta.mail.Address[])
                '''

      script {
        if (clean.toBoolean()) {
          cleanWs()
        }
      }
    }
  }
}