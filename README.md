# 🚀 DevOps Full Stack Project

Infrastructure cloud complète avec CI/CD automatisé, 
conteneurisation Docker, déploiement Kubernetes et monitoring Prometheus.

## 🏗️ Architecture
GitHub Actions CI/CD
↓
Docker Hub (Image Registry)
↓
Kubernetes Cluster
↓
App Node.js + Prometheus Metrics
↓
Terraform (AWS Infrastructure)

## 🛠️ Stack Technique

| Couche | Outils |
|--------|--------|
| Application | Node.js, REST API |
| Conteneurisation | Docker |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |
| Infrastructure | Terraform, AWS |
| Monitoring | Prometheus |
| Cloud Storage | Backblaze B2 |

## 📁 Structure du Projet
├── .github/workflows/    # Pipelines CI/CD GitHub Actions
├── terraform/            # Infrastructure as Code (AWS)
├── k8s/                  # Manifests Kubernetes
├── scripts/              # Scripts d'automatisation
├── tests/                # Tests automatisés
├── Dockerfile            # Conteneurisation de l'app
├── metrics.js            # Exposition métriques Prometheus
└── deploy.yaml           # Configuration déploiement

## 🚀 Démarrage Rapide

### Lancer avec Docker
```bash
docker build -t my-devops-app .
docker run -p 3000:3000 my-devops-app
```

### Déployer l'infrastructure Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Déployer sur Kubernetes
```bash
kubectl apply -f k8s/
kubectl get pods
```

## ⚙️ Pipeline CI/CD

Le pipeline GitHub Actions s'exécute automatiquement à chaque push sur `main` :

1. ✅ Exécution des tests
2. 🐳 Build de l'image Docker
3. 📦 Push vers Docker Hub
4. 🚀 Déploiement automatique

## 📊 Monitoring

L'application expose des métriques Prometheus sur `/metrics` :
- Nombre de requêtes HTTP
- Latence des endpoints
- Statut de santé de l'application

## 👩‍💻 Auteur

**Nourelhouda Naimi** — Cloud & DevOps Engineer  
[LinkedIn](https://linkedin.com/in/nourelhouda-naimi-361894125) | 
[GitHub](https://github.com/NaimiNour)
