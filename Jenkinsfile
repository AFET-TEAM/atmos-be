pipeline {
    agent any
    environment {
        // Proje İsimleri
        APP_NAME_API = "atos-api"
        APP_NAME_WEB = "atos-web"
        // Network
        NETWORK_NAME = "app-network"
    }

    stages {
        stage('Ortam ve Port Analizi') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        // --- PROD ---
                        env.API_CONTAINER = "${APP_NAME_API}-prod"
                        env.WEB_CONTAINER = "${APP_NAME_WEB}-prod"
                        env.API_PORT = "3003"
                        env.WEB_PORT = "83"  // Web sitesi varsayılan port
                        echo ">>> CANLI ORTAM (PROD) Hazırlanıyor..."
                    }
                    else if (env.BRANCH_NAME == 'develop') {
                        // --- DEV ---
                        env.API_CONTAINER = "${APP_NAME_API}-dev"
                        env.WEB_CONTAINER = "${APP_NAME_WEB}-dev"
                        env.API_PORT = "3004"
                        env.WEB_PORT = "8084"
                        echo ">>> GELİŞTİRME ORTAMI (DEV) Hazırlanıyor..."
                    }
                    else {
                        // --- TEST ---
                        env.API_CONTAINER = "${APP_NAME_API}-test-${env.BRANCH_NAME}"
                        env.WEB_CONTAINER = "${APP_NAME_WEB}-test-${env.BRANCH_NAME}"
                        env.API_PORT = "3005"
                        env.WEB_PORT = "8085"
                    }
                }
            }
        }

        stage('Build Images') {
            steps {
                script {
                    echo "--- API Image Derleniyor (Bun) ---"
                    // -f Dockerfile.api parametresiyle özel dosya ismini belirtiyoruz
                    sh "docker build -f Dockerfile.api -t ${APP_NAME_API}:${env.BRANCH_NAME} ."

                    echo "--- Web Image Derleniyor (Node/Astro) ---"
                    // -f Dockerfile.web parametresiyle özel dosya ismini belirtiyoruz
                    sh "docker build -f Dockerfile.web -t ${APP_NAME_WEB}:${env.BRANCH_NAME} ."
                }
            }
        }

        stage('Deploy API') {
            steps {
                script {
                    // Eski API container'ı temizle
                    sh "docker stop ${env.API_CONTAINER} || true"
                    sh "docker rm ${env.API_CONTAINER} || true"
                    // Network yoksa oluştur (Opsiyonel, hata almamak için)
                    sh "docker network create ${NETWORK_NAME} || true"

                    // API Başlat
                    sh """
                        docker run -d \
                        --name ${env.API_CONTAINER} \
                        --network ${NETWORK_NAME} \
                        --restart always \
                        --env-file /var/jenkins_home/prod.env \
                        -p ${env.API_PORT}:3000 \
                        ${APP_NAME_API}:${env.BRANCH_NAME}
                    """
                }
            }
        }

        stage('Deploy Web') {
            steps {
                script {
                    // Eski WEB container'ı temizle
                    sh "docker stop ${env.WEB_CONTAINER} || true"
                    sh "docker rm ${env.WEB_CONTAINER} || true"

                    // Web Başlat (API URL'ini environment olarak geçmek isteyebilirsiniz)
                    sh """
                        docker run -d \
                        --name ${env.WEB_CONTAINER} \
                        --network ${NETWORK_NAME} \
                        --restart always \
                        -p ${env.WEB_PORT}:4321 \
                        -e PUBLIC_API_URL=http://${env.API_CONTAINER}:3000 \
                        ${APP_NAME_WEB}:${env.BRANCH_NAME}
                    """
                    echo ">>> Deployment Tamamlandı!"
                    echo "API: Port ${env.API_PORT}"
                    echo "WEB: Port ${env.WEB_PORT}"
                }
            }
        }
    }
}
