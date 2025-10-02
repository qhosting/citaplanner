
# Scripts de Utilidad

## generate-master-hash.ts

Script para generar hashes de master password compatibles con bcryptjs.

### Uso

```bash
# Modo interactivo (te pedirá el password)
npm run generate-hash

# Con password como argumento
npm run generate-hash -- "tu_password_aqui"
```

### ¿Por qué este script?

El hash de master password debe ser generado con **bcryptjs** (la librería usada en Node.js) para asegurar compatibilidad total. Los hashes generados con Python bcrypt pueden tener problemas de compatibilidad debido a diferencias en los prefijos ($2a$ vs $2b$).

### Características

- ✅ Genera hashes compatibles con bcryptjs
- ✅ Usa 12 salt rounds (balance seguridad/performance)
- ✅ Verifica automáticamente que el hash funciona
- ✅ Proporciona instrucciones claras para configurar en Easypanel

### Ejemplo de salida

```
🔐 Generando hash de master password...

✅ Hash generado exitosamente!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 MASTER_PASSWORD_HASH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$2a$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Instrucciones:
1. Copia el hash completo de arriba
2. En Easypanel, ve a tu aplicación > Environment
3. Actualiza la variable MASTER_PASSWORD_HASH con este valor
4. Guarda los cambios y reinicia el contenedor
```

