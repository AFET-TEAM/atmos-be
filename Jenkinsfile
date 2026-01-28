pipeline {
    agent any
    environment {
        APP_NAME_API = "atos-api"
        APP_NAME_WEB = "atos-web"
        NETWORK_NAME = "traefik_public"
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {
        stage('1. Ortam ve Domain Belirleme') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.API_CONTAINER = "${APP_NAME_API}-prod"
                        env.WEB_CONTAINER = "${APP_NAME_WEB}-prod"
                        
                        env.API_DOMAIN = "api-atos.afet.team"
                        env.WEB_DOMAIN = "atos.afet.team"
                        
                        echo ">>> CANLI ORTAM (PROD) - Web: ${env.WEB_DOMAIN} / API: ${env.API_DOMAIN}"
                    }
                    else if (env.BRANCH_NAME == 'test') {
                        env.API_CONTAINER = "${APP_NAME_API}-dev"
                        env.WEB_CONTAINER = "${APP_NAME_WEB}-dev"
                        
                        env.API_DOMAIN = "api-atos-dev.afet.team"
                        env.WEB_DOMAIN = "atos-dev.afet.team"
                        
                        echo ">>> GELİŞTİRME ORTAMI (DEV) - Web: ${env.WEB_DOMAIN}"
                    }
                }
            }
        }

        stage('2. SonarQube Analizi') {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner"
                }
            }
        }

        stage('3. Build Images') {
            steps {
                script {
                    echo "--- API Image Derleniyor (Bun) ---"
                    sh "docker build --no-cache -f Dockerfile.api -t ${APP_NAME_API}:${env.BRANCH_NAME} ."

                    echo "--- Web Image Derleniyor (Node/Astro) ---"
                    sh "docker build --no-cache -f Dockerfile.web -t ${APP_NAME_WEB}:${env.BRANCH_NAME} ."
                }
            }
        }

        stage('4. Deploy API (Backend)') {
            steps {
                script {
                    def bt = '\u0060'
                    def traefikRule = "Host(${bt}${env.API_DOMAIN}${bt})"

                    sh "docker stop ${env.API_CONTAINER} || true"
                    sh "docker rm ${env.API_CONTAINER} || true"

                    sh """
                        docker run -d \
                        --name ${env.API_CONTAINER} \
                        --network ${NETWORK_NAME} \
                        --restart always \
                        --env-file /var/jenkins_home/atos.env \
                        \
                        --label "traefik.enable=true" \
                        --label "traefik.http.routers.${env.API_CONTAINER}.rule=${traefikRule}" \
                        --label "traefik.http.routers.${env.API_CONTAINER}.entrypoints=websecure" \
                        --label "traefik.http.routers.${env.API_CONTAINER}.tls.certresolver=myresolver" \
                        --label "traefik.http.services.${env.API_CONTAINER}.loadbalancer.server.port=3000" \
                        \
                        ${APP_NAME_API}:${env.BRANCH_NAME}
                    """
                }
            }
        }

        stage('5. Deploy Web (Frontend)') {
            steps {
                script {
                    def bt = '\u0060'
                    def traefikRule = "Host(${bt}${env.WEB_DOMAIN}${bt})"

                    sh "docker stop ${env.WEB_CONTAINER} || true"
                    sh "docker rm ${env.WEB_CONTAINER} || true"

                    sh """
                        docker run -d \
                        --name ${env.WEB_CONTAINER} \
                        --network ${NETWORK_NAME} \
                        --restart always \
                        -e PUBLIC_API_URL=https://${env.API_DOMAIN} \
                        \
                        --label "traefik.enable=true" \
                        --label "traefik.http.routers.${env.WEB_CONTAINER}.rule=${traefikRule}" \
                        --label "traefik.http.routers.${env.WEB_CONTAINER}.entrypoints=websecure" \
                        --label "traefik.http.routers.${env.WEB_CONTAINER}.tls.certresolver=myresolver" \
                        --label "traefik.http.services.${env.WEB_CONTAINER}.loadbalancer.server.port=4321" \
                        \
                        ${APP_NAME_WEB}:${env.BRANCH_NAME}
                    """
                    
                    echo ">>> Deployment Tamamlandı!"
                    echo "API: https://${env.API_DOMAIN}"
                    echo "WEB: https://${env.WEB_DOMAIN}"
                }
            }
        }
    }
}