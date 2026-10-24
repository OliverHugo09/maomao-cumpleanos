# El Almanaque de Maomao 🌿

Landing page **estática** (sin base de datos) para visualizar los cumpleaños de
personas importantes, con temática de *Los Diarios de la Boticaria* (Maomao) y
contadores en vivo de **días, horas, minutos y segundos**.

Los datos provienen de un único archivo: [`data/birthdays.json`](./data/birthdays.json).

## Cómo verla

Por seguridad, los navegadores no permiten leer un archivo JSON con `file://`,
así que hay que abrirla desde un pequeño servidor local. Elige una opción:

**Opción A — doble clic (Windows)**
1. Ejecuta `start.bat`.
2. Abre <http://localhost:8080> en el navegador.

**Opción B — Python**
```bash
python -m http.server 8080
```
y abre <http://localhost:8080>.

**Opción C — Node**
```bash
npm start        # usa `serve`
```

## Añadir o editar personas

Edita `data/birthdays.json`. Cada entrada acepta:

| Campo     | Tipo   | Obligatorio | Descripción                                   |
|-----------|--------|-------------|-----------------------------------------------|
| `nombre`  | string | sí          | Nombre que se muestra en la tarjeta.          |
| `relacion`| string | no          | Relación (Madre, Hermano, etc.).              |
| `fecha`   | string | sí          | Fecha de nacimiento `YYYY-MM-DD`. El año sirve para calcular la edad que cumplen. |
| `nota`    | string | no          | Frase corta opcional bajo la fecha.           |

La tarjeta se ordena automáticamente por proximidad y calcula la edad según el año.

## Estructura

```
maomao-cumpleanos/
├── index.html          # marca de la página
├── css/styles.css      # paleta de colores + diseño
├── js/app.js           # carga JSON + contadores en vivo
├── data/birthdays.json # DATOS (éditalo aquí)
├── package.json        # scripts de servidor local
├── start.bat           # servidor local en Windows (doble clic)
├── README.md
└── docs/REPORTE.md     # reporte completo del proyecto
```
