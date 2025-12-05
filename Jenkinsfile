pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '-u root:root'
        }
    }

    environment {
        DOCKER_REGISTRY = credentials('docker-registry')
        APP_NAME = 'atos-app'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = "${env.GIT_COMMIT[0..7]}"
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT_SHORT}"
        PRODUCTION_SERVER = credentials('production-server')
        DEPLOY_PATH = '/opt/atos-app'
    }

    stages {
        stage('🔍 Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                sh '''
                    echo "Current branch: ${env.GIT_BRANCH}"
                    echo "Commit hash: ${env.GIT_COMMIT}"
                    ls -la
                '''
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh '''
                    # Install pnpm
                    corepack enable
                    corepack prepare pnpm@latest --activate

                    # Install dependencies
                    pnpm install --frozen-lockfile

                    # Verify installations
                    echo "Node version: $(node --version)"
                    echo "pnpm version: $(pnpm --version)"
                '''
            }
        }

        stage('🧪 Test & Lint') {
            parallel {
                stage('🔍 API Tests') {
                    steps {
                        echo '🧪 Running API tests...'
                        dir('apps/api') {
                            sh '''
                                # API testleri burada çalışacak
                                echo "API tests will run here"
                                # bun test (eğer test setup'ı varsa)
                            '''
                        }
                    }
                }

                stage('🔍 Web Tests') {
                    steps {
                        echo '🧪 Running Web tests...'
                        dir('apps/web') {
                            sh '''
                                # Web testleri burada çalışacak
                                echo "Web tests will run here"
                                # pnpm test (eğer test setup'ı varsa)
                            '''
                        }
                    }
                }

                stage('📝 Lint Check') {
                    steps {
                        echo '📝 Running lint checks...'
                        sh '''
                            # Lint kontrolü
                            echo "Lint checks will run here"
                            # pnpm lint (eğer lint setup'ı varsa)
                        '''
                    }
                }
            }
        }

        stage('🏗️ Build') {
            parallel {
                stage('🐳 Build API Docker Image') {
                    steps {
                        echo '🏗️ Building API Docker image...'
                        script {
                            def apiImage = docker.build("${APP_NAME}-api:${IMAGE_TAG}", "-f Dockerfile.api .")
                            env.API_IMAGE_ID = apiImage.id
                        }
                    }
                }

                stage('🐳 Build Web Docker Image') {
                    steps {
                        echo '🏗️ Building Web Docker image...'
                        script {
                            def webImage = docker.build("${APP_NAME}-web:${IMAGE_TAG}", "-f Dockerfile.web .")
                            env.WEB_IMAGE_ID = webImage.id
                        }
                    }
                }
            }
        }

        stage('🔒 Security Scan') {
            steps {
                echo '🔒 Running security scans...'
                sh '''
                    # Docker image security scan
                    echo "Security scans will run here"
                    # docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${APP_NAME}-api:${IMAGE_TAG}
                    # docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${APP_NAME}-web:${IMAGE_TAG}
                '''
            }
        }

        stage('📤 Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo '📤 Pushing images to registry...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-registry') {
                        def apiImage = docker.image("${APP_NAME}-api:${IMAGE_TAG}")
                        def webImage = docker.image("${APP_NAME}-web:${IMAGE_TAG}")

                        apiImage.push()
                        apiImage.push("latest")

                        webImage.push()
                        webImage.push("latest")
                    }
                }
            }
        }

        stage('🚀 Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo '🚀 Deploying to staging environment...'
                sh '''
                    echo "Staging deployment will run here"
                    # SSH to staging server and deploy
                '''
            }
        }

        stage('🎯 Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '🎯 Deploying to production environment...'
                script {
                    try {
                        // Backup current deployment
                        sh '''
                            echo "Creating backup of current deployment..."
                            ssh -o StrictHostKeyChecking=no ${PRODUCTION_SERVER} "
                                cd ${DEPLOY_PATH}
                                docker-compose -f docker-compose.prod.yml down
                                tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .
                                mv backup-*.tar.gz /opt/backups/
                            "
                        '''

                        // Deploy new version
                        sh '''
                            echo "Deploying new version to production..."

                            # Copy docker-compose file
                            scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${PRODUCTION_SERVER}:${DEPLOY_PATH}/
                            scp -o StrictHostKeyChecking=no .env.production ${PRODUCTION_SERVER}:${DEPLOY_PATH}/.env

                            # Deploy on remote server
                            ssh -o StrictHostKeyChecking=no ${PRODUCTION_SERVER} "
                                cd ${DEPLOY_PATH}

                                # Pull latest images
                                docker pull ${APP_NAME}-api:${IMAGE_TAG}
                                docker pull ${APP_NAME}-web:${IMAGE_TAG}

                                # Update environment variables
                                export IMAGE_TAG=${IMAGE_TAG}

                                # Deploy with zero-downtime
                                docker-compose -f docker-compose.prod.yml up -d --force-recreate

                                # Wait for services to be healthy
                                sleep 30
                                docker-compose -f docker-compose.prod.yml ps

                                # Cleanup old images
                                docker image prune -f
                            "
                        '''

                        // Health check
                        sh '''
                            echo "Running post-deployment health checks..."
                            ssh -o StrictHostKeyChecking=no ${PRODUCTION_SERVER} "
                                # Wait a bit more for services to fully start
                                sleep 30

                                # Check if services are running
                                docker-compose -f ${DEPLOY_PATH}/docker-compose.prod.yml ps

                                # Health check endpoints
                                curl -f http://localhost:8080/health || exit 1
                                curl -f http://localhost:8081/ || exit 1

                                echo 'Deployment successful! 🎉'
                            "
                        '''

                    } catch (Exception e) {
                        echo "Deployment failed! Rolling back..."
                        sh '''
                            ssh -o StrictHostKeyChecking=no ${PRODUCTION_SERVER} "
                                cd ${DEPLOY_PATH}
                                docker-compose -f docker-compose.prod.yml down

                                # Restore from backup
                                LATEST_BACKUP=$(ls -t /opt/backups/backup-*.tar.gz | head -n1)
                                tar -xzf $LATEST_BACKUP

                                # Start previous version
                                docker-compose -f docker-compose.prod.yml up -d

                                echo 'Rollback completed!'
                            "
                        '''
                        throw e
                    }
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up workspace...'
            sh '''
                # Cleanup Docker images
                docker system prune -f || true

                # Clean workspace
                rm -rf node_modules || true
                rm -rf apps/*/node_modules || true
                rm -rf apps/web/dist || true
            '''
        }

        success {
            echo '✅ Pipeline completed successfully!'
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ *${APP_NAME}* deployment successful!\n" +
                        "Branch: `${env.GIT_BRANCH}`\n" +
                        "Version: `${IMAGE_TAG}`\n" +
                        "Build: #${BUILD_NUMBER}"
            )
        }

        failure {
            echo '❌ Pipeline failed!'
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ *${APP_NAME}* deployment failed!\n" +
                        "Branch: `${env.GIT_BRANCH}`\n" +
                        "Build: #${BUILD_NUMBER}\n" +
                        "Check: ${BUILD_URL}"
            )
        }
    }
}
