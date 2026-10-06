# Publicar los generadores en GitHub (con UDI y dólar automáticos)

Al terminar, tus asesores abrirán un enlace tipo `https://TU-USUARIO.github.io/generadores-asesores/` y los campos de UDI y dólar se llenarán solos con el valor oficial de Banxico (UDI: serie SP68257; dólar FIX: serie SF43718). Los campos se pueden seguir corrigiendo a mano.

## Qué contiene esta carpeta
- `index.html`: página de inicio con los dos generadores.
- `imagina-ser.html` y `segubeca.html`: las herramientas.
- `rates.json`: aquí se guardan los valores del día (empieza vacío).
- `scripts/actualizar_valores.js`: consulta Banxico.
- `.github/workflows/actualizar-valores.yml`: lo ejecuta todos los días a las 8:00 a.m. y a la 1:00 p.m. (hora de Ciudad de México).

## Pasos

1. **Token de Banxico (gratis).** Entra a https://www.banxico.org.mx/SieAPIRest/service/v1/token , genera tu token (son 64 caracteres) y cópialo.
2. **Cuenta y repositorio en GitHub.** Crea un repositorio **público** llamado `generadores-asesores`. (GitHub Pages gratis requiere repositorio público; ahí no se guarda ningún dato de clientes, solo las herramientas y los valores de UDI y dólar.)
3. **Sube los archivos.** En el repositorio: *Add file → Upload files*. Arrastra `index.html`, `imagina-ser.html`, `segubeca.html`, `rates.json` y la carpeta `scripts`. Presiona *Commit changes*.
4. **Crea el archivo automático.** *Add file → Create new file*. En el nombre escribe exactamente `.github/workflows/actualizar-valores.yml` (al escribir cada `/` se crea la carpeta). Pega el contenido del archivo `actualizar-valores.yml` de esta carpeta y presiona *Commit changes*.
5. **Guarda el token como secreto.** *Settings → Secrets and variables → Actions → New repository secret*. Nombre: `BANXICO_TOKEN`. Valor: tu token.
6. **Permiso de escritura.** *Settings → Actions → General → Workflow permissions → Read and write permissions → Save*.
7. **Activa la página.** *Settings → Pages → Source: Deploy from a branch → Branch: main, carpeta / (root) → Save*. En uno o dos minutos aparece tu dirección.
8. **Primera actualización a mano.** Pestaña *Actions → Actualizar valores UDI y dólar (Banxico) → Run workflow*. Al terminar, `rates.json` tendrá los valores y la página los usará.

## Si algo falla
- En *Actions* abre la corrida con la ❌ y lee el mensaje. `Banxico respondió 401` significa que el token está mal copiado en el secreto; `Falta BANXICO_TOKEN` significa que el secreto tiene otro nombre.
- Si algún día dejan de actualizarse los valores, entra a *Actions* y verifica que el flujo siga activo; GitHub pausa los flujos programados de repositorios sin actividad.
- Los campos siempre pueden capturarse a mano; la herramienta no depende de que la actualización funcione.

## Notas
- La UDI se toma del valor publicado por Banxico para el día de hoy. El dólar es el FIX más reciente publicado (en fin de semana o día festivo será el del último día hábil; la fecha aparece bajo el campo).
- Las herramientas cargan dos librerías públicas (lectura de PDF y Excel), por lo que necesitan internet al abrirse.
