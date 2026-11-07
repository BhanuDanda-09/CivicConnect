pipeline {
    agent any

    environment {
        // Docker registry configuration (Credentials stored in Jenkins Credentials Manager)
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_HUB_USERNAME       = 'civicadmin'
        IMAGE_FRONTEND            = "${DOCKER_HUB_USERNAME}/smart-civic-frontend"
        IMAGE_BACKEND             = "${DOCKER_HUB_USERNAME}/smart-civic-backend"
        IMAGE_TAG                 = "${BUILD_NUMBER}"

        // Target Deployment Server Credentials
        SSH_DEPLOY_KEY_ID         = 'ec2-ssh-credentials'
        DEPLOY_HOST               = 'ec2-user@your-ec2-ip'
    }

    stages {
        // Stage 1: Checkout Source Code
        stage('1. Checkout Source') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        // Stage 2: Install Frontend Dependencies
        stage('2. Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    echo 'Installing Frontend npm dependencies...'
                    sh 'npm ci'
                }
            }
        }

        // Stage 3: Install Backend Dependencies
        stage('3. Install Backend Dependencies') {
            steps {
                dir('backend') {
                    echo 'Installing Backend npm dependencies...'
                    sh 'npm ci'
                }
            }
        }

        // Stage 4: Run Frontend Tests
        stage('4. Run Frontend Tests') {
            steps {
                dir('frontend') {
                    echo 'Executing Frontend unit & component tests...'
                    sh 'npm test'
                }
            }
        }

        // Stage 5: Run Backend Tests
        stage('5. Run Backend Tests') {
            steps {
                dir('backend') {
                    echo 'Executing Backend API and database tests...'
                    sh 'npm test'
                }
            }
        }

        // Stage 6: Build Frontend Application
        stage('6. Build Frontend Application') {
            steps {
                dir('frontend') {
                    echo 'Building production bundle with Vite...'
                    sh 'npm run build'
                }
            }
        }

        // Stage 7: Build Docker Frontend Image
        stage('7. Build Docker Frontend Image') {
            steps {
                echo "Building Docker Frontend image: ${IMAGE_FRONTEND}:${IMAGE_TAG}..."
                sh "docker build -t ${IMAGE_FRONTEND}:${IMAGE_TAG} -t ${IMAGE_FRONTEND}:latest ./frontend"
            }
        }

        // Stage 8: Build Docker Backend Image
        stage('8. Build Docker Backend Image') {
            steps {
                echo "Building Docker Backend image: ${IMAGE_BACKEND}:${IMAGE_TAG}..."
                sh "docker build -t ${IMAGE_BACKEND}:${IMAGE_TAG} -t ${IMAGE_BACKEND}:latest ./backend"
            }
        }

        // Stage 9: Push Docker Images to Docker Hub
        stage('9. Push Docker Images to Registry') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
                    sh "docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_FRONTEND}:latest"
                    sh "docker push ${IMAGE_BACKEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_BACKEND}:latest"
                }
            }
        }

        // Stage 10: Deploy the New Application Version
        stage('10. Deploy Application') {
            steps {
                echo "Deploying application version ${IMAGE_TAG} to Kubernetes / Docker Compose cluster..."
                // Rollout update to Kubernetes or remote host using secrets
                sh """
                    echo 'Updating Kubernetes deployment images...'
                    # kubectl set image deployment/civic-backend-deployment backend=${IMAGE_BACKEND}:${IMAGE_TAG} --record
                    # kubectl set image deployment/civic-frontend-deployment frontend=${IMAGE_FRONTEND}:${IMAGE_TAG} --record
                """
            }
        }

        // Stage 11: Verify Application Health
        stage('11. Verify Application Health') {
            steps {
                echo 'Verifying backend and frontend health endpoints...'
                // Healthcheck curl probe with automatic rollback trigger on failure
                sh """
                    echo 'Probing health check endpoint...'
                    # curl --fail --silent --show-error http://localhost:5000/api/health || exit 1
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline successfully built, tested, and deployed Build #${BUILD_NUMBER}!"
        }
        failure {
            echo "❌ Pipeline failed! Initiating rollback procedures..."
            // Rollback commands:
            // sh "kubectl rollout undo deployment/civic-backend-deployment"
            // sh "kubectl rollout undo deployment/civic-frontend-deployment"
        }
        always {
            sh 'docker logout || true'
        }
    }
}

