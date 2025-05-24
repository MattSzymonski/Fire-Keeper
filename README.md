## Info
FireKeeper is a lightweight, campfire-themed monitoring service designed to run alongside your home server — a.k.a. your "Campfire".
It tracks system activity, provides real-time insights, and lets you interact with your server through a clean, extensible interface.

## Development
- Run with `docker-compose -f docker-compose-dev.yaml up`. Add `--build` if needed.
- Enter `http://localhost:5173/` on your machine you have connected to the server via SSH and it will display the page, crazy.  
- There is hot reloading, however after restarting container you need to refresh page to make it work again.   

In case of some issues with starting container try using: `docker-compose down --volumes --remove-orphans && docker system prune -af --volumes`

## Deployment
- Run with `docker-compose -f docker-compose.yaml up`

## Info 
- Backend server port is not exposed as it is supposed to interacts only with frontend which is in the same container. 