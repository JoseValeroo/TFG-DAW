# Fase 2: Configuración del Entorno

## Objetivo

Crear la base del proyecto .NET con todas las configuraciones necesarias.

## Herramientas
- **Claude Code**: Generación de scripts y estructura
- **GitHub Copilot**: Autocompletado en archivos de configuración

---

## Docker - Entorno de Desarrollo

### Servicios Incluidos

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| SQL Server 2017 | 1433 | Base de datos compatible con producción |
| Redis | 6379 | Caché distribuida |
| Azurite | 10000-10002 | Emulador Azure Storage |
| Mailhog | 1025/8025 | SMTP de pruebas |

### Configuración SQL Server

Compatible con producción:
- **Versión**: SQL Server 2017 (14.0)
- **Intercalación**: `SQL_Latin1_General_CP1250_CI_AS`
- **Imagen**: `mcr.microsoft.com/mssql/server:2017-latest`

### Inicio Rápido

```bash
# 1. Copiar plantilla de variables de entorno
cp .env.example .env

# 2. Editar .env con los valores del proyecto

# 3. Levantar servicios
docker-compose up -d

# 4. Verificar estado
docker-compose ps
```

### Cadenas de Conexión para Desarrollo

**SQL Server:**
```
Server=localhost,1433;Database=MiBaseDatos;User Id=sa;Password=DevPassword123!;TrustServerCertificate=True;
```

**Redis:**
```
localhost:6379
```

**Azure Storage (Azurite):**
```
DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
```

---

## IMPORTANTE

1. **NUNCA commitear el archivo `.env`** con credenciales reales
2. La contraseña de SA debe cumplir requisitos de complejidad de SQL Server
3. Para producción, usar **Azure Key Vault** (ver `Documentos_Base/01_Estructura_Tecnica/`)
4. El código debe funcionar con **infraestructura balanceada** (usar Redis, Azure Blob Storage)

---

## Checklist

- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar variables de entorno
- [ ] Ejecutar `docker-compose up -d`
- [ ] Verificar que todos los servicios estén running
- [ ] Generar solución y proyectos .NET en `03_Codigo/`
- [ ] Instalar dependencias NuGet
- [ ] Configurar appsettings.json (sin secretos)
- [ ] Configurar User Secrets para desarrollo local
- [ ] Verificar compilación exitosa
- [ ] Probar conexión a SQL Server

---

## Archivos de esta carpeta

| Archivo | Descripción |
|---------|-------------|
| `docker-compose.yml` | Definición de servicios Docker |
| `.env.example` | Plantilla de variables de entorno |
| `Scripts/` | Scripts de setup y SQL |

---

## Enlaces

- [README principal](../README.md)
- [Anterior: Diseño](../01_Diseño/)
- [Siguiente: Código](../03_Codigo/)
