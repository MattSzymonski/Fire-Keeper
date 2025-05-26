# Fire Keeper
Fire-Keeper is a sleek, responsive, and self-hosted server dashboard designed to run in a Docker container. 
It provides a centralized overview of your server's health and quick access to your most-used self-hosted services.

## Features
- 🧭 Service shortcuts: customizable buttons to open self-hosted tools and services (e.g. file manager, photo gallery, etc)
- 📊 System monitoring: online/offline status, uptime, CPU load, RAM usage, SSL Ccertificate expiry
- 🐳 Docker containers overview: Status of running/stopped containers

Fire-Keeper can be installed as a Progressive Web App (PWA), allowing access to the dashboard even when the server is unreachable.

## Deployment
### 1. Clone the repository
```
git clone https://github.com/MattSzymonski/Fire-Keeper.git
cd Fire-Keeper
```
### 2. Configure the project
Before building the container, make the following adjustments:

- Environment Variables  
In docker-compose.yaml, update:
    - `VITE_SERVER_IP` – your server's IP address
    - `VITE_SERVER_URL` – your server's domain or public URL
- SSL Certificate  
Update the SSL certificate paths to match the location of your certificate and key on the server.
- Network Settings  
Modify the networks section in docker-compose.yaml if needed to fit your infrastructure.
- Branding  
Replace the default favicon and logo in `./frontend/public/` with your own.
- bService Shortcuts  
Customize the shortcut buttons in `./frontend/src/components/ServicesShortcuts.tsx` to match the services you host.

### 3. Build and run the container
```
docker compose -f up --build -d
```
### 4. Make it public
Use your preferred web server or reverse proxy (like Nginx, Caddy, or Traefik) to expose the container to the internet.

## Development
- Run with `docker-compose -f docker-compose-dev.yaml up --build`
- Enter `http://localhost:5173/` to see the dashboard

Both frontend and backend programs are hot-reloadable.
