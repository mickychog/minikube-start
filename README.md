# ☸️ Kubernetes en tu Laptop: Mi Primer Laboratorio DevOps en Linux

> **Autor:** Miguel Angel Choque Garcia  
> **Descripción:** Guía práctica para configurar y desplegar un clúster de Kubernetes local en sistemas GNU/Linux, construyendo un entorno ideal para iniciar tu camino en la cultura DevOps.

---

## 📋 Tabla de Contenidos

1. [Prerequisitos](#-prerequisitos)
2. [Instalar Docker](#-instalar-docker)
3. [Instalar kubectl](#-instalar-kubectl)
4. [Instalar Minikube](#-instalar-minikube)

---

## ✅ Prerequisitos

### Hardware mínimo

| Recurso | Mínimo |
|---------|--------|
| CPU | 2 núcleos |
| RAM libre | 2 GB |
| Disco | 20 GB |
| Red | Conexión a internet |


### Software necesario

```bash
# Verificar Docker instalado
docker --version

# Verificar curl disponible
curl --version
```

---

## 🐳 Instalar Docker

Docker es el motor de contenedores que Minikube usará como driver. Es el prerequisito más importante antes de instalar cualquier otra herramienta.

### Paso 0 — Desinstalar versiones antiguas o conflictivas

```bash
sudo apt remove $(dpkg --get-selections \
  docker.io docker-compose docker-doc podman-docker containerd runc \
  2>/dev/null | cut -f1) 2>/dev/null || true
```

> Ignora los errores si no tenías ninguno instalado — es normal.

---

### Método oficial — Repositorio apt (Debian)

> 📖 Basado en la [documentación oficial de Docker para Debian](https://docs.docker.com/engine/install/debian/).

#### Paso 1 — Instalar dependencias

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

#### Paso 2 — Agregar la clave GPG oficial de Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

#### Paso 3 — Agregar el repositorio con DEB822

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

#### Paso 4 — Instalar Docker Engine

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

#### Paso 5 — Iniciar y habilitar el servicio

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
```

#### Paso 6 — Verificar instalación

```bash
sudo docker run hello-world
# Resultado esperado: "Hello from Docker!" ✅
```

---

### 🌿 Ejemplo para Linux Mint 22 (basado en Ubuntu Noble)

Linux Mint **no** expone `VERSION_CODENAME` de la base Ubuntu correctamente, por lo que el comando genérico falla. Usa este procedimiento adaptado:

> Linux Mint 22 está basado en **Ubuntu 24.04 (Noble Numbat)** → el codename a usar es `noble`.

#### Paso 1 — Dependencias y clave GPG

```bash
sudo apt update
sudo apt install -y ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

#### Paso 2 — Agregar repositorio apuntando a Ubuntu Noble

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: noble
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

#### Paso 3 — Instalar y verificar

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

sudo systemctl enable --now docker
sudo docker run hello-world
```

> 💡 **Tabla de referencia Mint → Ubuntu → Codename:**
> | Linux Mint | Base Ubuntu | Codename a usar |
> |------------|-------------|-----------------|
> | 22.x       | 24.04       | `noble`         |
> | 21.x       | 22.04       | `jammy`         |
> | 20.x       | 20.04       | `focal`         |

---

### Método rápido — Script de conveniencia

> ⚠️ Solo recomendado para entornos de desarrollo/laboratorio, **no para producción**.

```bash
curl -fsSL https://get.docker.com | sudo bash
```

---

### ⚙️ Configurar Docker sin sudo (necesario para Minikube)

Por defecto Docker requiere `sudo`. **Minikube con driver Docker falla si no configuras esto.**

```bash
# 1. Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
```

#### ⚠️ El problema con `newgrp docker`

```bash
# 2. Intentar aplicar el grupo en la terminal actual
newgrp docker
```

> **`newgrp docker` abre una sub-shell nueva** con el grupo activo, pero al salir (`exit`) vuelves a la shell original sin el grupo. Esto puede causar confusión porque `docker ps` funciona dentro pero falla fuera.

**La forma más confiable es cerrar sesión completamente:**

```bash
# Opción A — Cerrar sesión gráfica y volver a entrar (recomendado)
# (en entornos de escritorio: cerrar sesión desde el menú del sistema)

# Opción B — En terminal SSH, reconectarse

# Opción C — Forzar recarga del grupo sin cerrar sesión (avanzado)
exec su -l $USER
```

#### Verificar que funciona sin sudo

```bash
# Debe responder sin pedir contraseña ni dar "permission denied"
docker run hello-world

# Confirmar que tu usuario está en el grupo
groups | grep docker
```

---

### Iniciar y habilitar el servicio Docker

```bash
sudo systemctl start docker       # Iniciar ahora
sudo systemctl enable docker      # Arrancar automáticamente con el sistema
sudo systemctl status docker      # Verificar estado
```

---

### Verificar la instalación completa

```bash
docker --version          # Docker version 27.x.x, build ...
docker compose version    # Docker Compose version v2.x.x
docker info               # Información detallada del daemon
docker run hello-world    # Prueba funcional
```

---

### Comandos básicos de Docker

```bash
docker images                          # Listar imágenes locales
docker ps                              # Listar contenedores en ejecución
docker ps -a                           # Listar todos (incluidos detenidos)
docker pull nginx                      # Descargar imagen de Docker Hub
docker run -d -p 8080:80 nginx         # Ejecutar nginx en background
docker run -it ubuntu bash             # Ejecutar contenedor interactivo
docker stop <id_o_nombre>              # Detener un contenedor
docker rm   <id_o_nombre>              # Eliminar un contenedor detenido
docker rmi  <imagen>                   # Eliminar una imagen local
docker build -t mi-app:v1 .            # Construir imagen desde Dockerfile
docker logs <id_o_nombre>              # Ver logs del contenedor
docker logs <id_o_nombre> -f           # Logs en tiempo real
docker exec -it <id_o_nombre> bash     # Abrir shell en contenedor en ejecución
docker inspect <id_o_nombre>           # Detalles completos del contenedor
docker system prune                    # Limpiar contenedores/imágenes sin uso
```

---

### 📦 ¿Qué más instalar relacionado con Docker?

Con `docker-ce` + `docker-compose-plugin` + `docker-buildx-plugin` ya tienes lo esencial para este lab. Según tu flujo de trabajo, considera estas herramientas complementarias:

#### Resumen: lo que ya tienes vs lo opcional

| Herramienta | Estado | Para qué sirve |
|-------------|--------|---------------|
| `docker-ce` | ✅ Instalado | Motor de contenedores |
| `docker-compose-plugin` | ✅ Instalado | Orquestar multi-contenedor (`docker compose up`) |
| `docker-buildx-plugin` | ✅ Instalado | Builds multi-plataforma (arm64, amd64) |
| `lazydocker` | ⭐ Recomendado | TUI visual — ideal para aprendizaje |
| `dive` | 💡 Útil | Analizar y optimizar capas de imágenes |
| `ctop` | 💡 Útil | Monitor de recursos por contenedor |
| `Portainer` | 💡 Opcional | UI web si prefieres no usar terminal |

#### Lazydocker — TUI visual para Docker 

```bash
curl https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update_linux.sh | bash
# Ejecutar
lazydocker
```
---

## 🔧 Instalar kubectl

`kubectl` es la herramienta de línea de comandos para interactuar con Kubernetes.

[Documentación oficial de Kubectl para Linux](https://kubernetes.io/es/docs/tasks/tools/included/install-kubectl-linux/).

### Paso 1 — Descargar el binario

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

### Paso 2 — Instalar

```bash
chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl
```

### Paso 3 — Verificar

```bash
kubectl version --client
# Resultado esperado: Client Version: v1.x.x
```

### Alternativa con apt (Debian/Ubuntu)

```bash
# Actualice el índice de paquetes de apt e instale los paquetes necesarios para usar Kubernetes con el repositorio apt:
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl
# Descargue la clave de firma pública de Google Cloud:
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
# Agregue el repositorio de Kubernetes a apt:
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
# Actualice el índice de paquetes de apt con el nuevo repositorio e instale kubectl:
sudo apt-get update
sudo apt-get install -y kubectl
```

## 🚀 Instalar Minikube

Minikube ejecuta un clúster de Kubernetes de un solo nodo localmente — ideal para desarrollo y aprendizaje.

[Documentación oficial de Minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download)

### Paso 1 — Descargar

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
```

### Paso 2 — Instalar

```bash
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Paso 3 — Verificar

```bash
minikube version
# Resultado esperado: minikube version: v1.x.x
```

### Paso 4 — Iniciar el clúster

```bash
minikube start --driver=docker
# La primera vez descarga imágenes (~500 MB), puede tardar unos minutos
```

### Drivers disponibles

```bash
# Docker (recomendado si tienes Docker instalado)
minikube start --driver=docker

# VirtualBox
minikube start --driver=virtualbox

# KVM2 (Linux nativo)
minikube start --driver=kvm2

# Podman
minikube start --driver=podman
```

### Comandos básicos de Minikube

```bash
minikube status       # Estado del clúster
minikube stop         # Detener el clúster
minikube delete       # Eliminar el clúster
minikube ip           # Obtener la IP del clúster
minikube dashboard    # Abrir la UI web de Kubernetes
```

### Add-ons útiles

```bash
minikube addons list                        # Ver todos los add-ons
minikube addons enable ingress              # Habilitar Ingress Controller
minikube addons enable metrics-server       # Habilitar Metrics Server
minikube addons enable dashboard            # Habilitar Dashboard
minikube addons enable registry             # Habilitar Registry local
```

---
