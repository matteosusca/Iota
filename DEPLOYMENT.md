# Iota Production Deployment Guide

This guide explains how to deploy the full Iota application stack into a production environment, specifically targeting **Portainer** and **Nginx Proxy Manager**.

## Architecture Overview
The provided `docker-compose.yml` launches three services:
1. `db`: A PostgreSQL database instance.
2. `backend`: The Node/Fastify API server (automatically pushes schema schema updates on boot).
3. `frontend`: An Nginx-powered Alpine instance that serves the Vue static files and handles proxying all API requests directly to the internal backend.

**Crucially, only the frontend needs to be exposed internally to your reverse proxy network.**

## 1. Portainer Deployment (Stack Setup)

1. Navigate to your Portainer dashboard and go to **Stacks** -> **Add Stack**.
2. Name the stack `iota`.
3. Select **Web editor** and paste the entire contents of the `docker-compose.yml` file.
4. Add the following **Environment variables** in the Portainer GUI:

| Environment Variable | Example Value | Description |
|----------------------|---------------|-------------|
| `DB_USER`            | `iota`      | Username for Postgres (optional default provided) |
| `DB_PASSWORD`        | `securepassword`| Strong password for your DB! |
| `DB_NAME`            | `iota`   | Target database name |
| `CORS_ORIGIN`        | `https://iota.example.com` | Ensure this matches your final domain. |
| `JWT_SECRET`         | `something-very-unguessable` | The secret used to secure logic |
| `FRONTEND_PORT`      | `8080`        | The host port exposed on your server (default 8080) |

5. Click **Deploy the stack**.

---

## 2. Nginx Proxy Manager Setup

Once the stack is spun up and "healthy" in Portainer:

1. Open your Nginx Proxy Manager UI.
2. Click **Proxy Hosts** -> **Add Proxy Host**.
3. **Domain Names**: Enter your desired front-facing domain (e.g., `iota.example.com`).
4. **Scheme**: `http`
5. **Forward Hostname / IP**: Enter the local IP of your server running the Portainer stack.
6. **Forward Port**: Enter the `FRONTEND_PORT` you assigned (e.g. `8080`).
7. **Cache Assets**: Check the box.
8. **Block Common Exploits**: Check the box.
9. **Websockets Support**: Check the box (Required for smooth reverse-proxy API routing).
10. Navigate to the **SSL** tab:
    * Select **Request a new SSL Certificate**.
    * Check **Force SSL**, **HTTP/2 Support**, and **HSTS Enabled**.
    * Agree to the Let's Encrypt Terms and click **Save**.

---

## 3. Troubleshooting / Logging

If something isn't working after setting up Nginx Proxy Manager:
- **API Errors / Auth Fails**: Verify `CORS_ORIGIN` in portainer exactly matches the `https://iota.example.com` origin you defined. Don't leave trailing slashes!
- **Database Refusing Connection**: Ensure your passwords inside `DB_PASSWORD` do not contain un-escaped complex bash characters if Portainer acts up.

You're done! Enjoy your self-hosted version of Iota!
