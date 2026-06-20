# ✨ Vision Board Generator

Una aplicación web estática que guía al usuario a través de un cuestionario interactivo de 5 preguntas y genera un **collage visual personalizado** descargable como imagen PNG.

Diseñada con un enfoque **ADHD-friendly**: una pregunta a la vez, interfaz minimalista y modo pantalla completa para usar el board como recordatorio visual constante.

---

## Características

- **Wizard interactivo** — 5 preguntas con transiciones suaves y barra de progreso
- **Canvas dinámico** — el collage adapta colores, patrones de fondo e iconos según tus respuestas
- **Descarga como imagen** — exporta tu board en PNG de alta resolución (1200×800)
- **Persistencia** — los datos se guardan en `localStorage`; si cierras la pestaña, puedes recuperar tu board
- **Pantalla completa** — modo "ancla de visión" para dejarlo abierto como recordatorio constante
- **100% vanilla** — HTML, CSS y JavaScript puro, sin frameworks ni dependencias externas

---

## Estructura del proyecto

```
VisionBoardGenerator/
├── index.html   → Estructura y pantallas
├── style.css    → Paleta pastel, animaciones, responsive
├── script.js    → Wizard, lógica de canvas, storage
└── README.md
```

---

## Cómo ejecutarlo localmente

1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/[tu-usuario]/VisionBoardGenerator.git
   cd VisionBoardGenerator
   ```

2. Abre `index.html` directamente en tu navegador:
   ```bash
   open index.html        # macOS
   start index.html       # Windows
   xdg-open index.html    # Linux
   ```

   > No necesitas ningún servidor local ni instalar dependencias.

---

## Despliegue en GitHub Pages

🔗 **[Ver demo en vivo →](https://[tu-usuario].github.io/VisionBoardGenerator)**

Para desplegarlo tú mismo:
1. Sube el repositorio a GitHub
2. Ve a **Settings → Pages**
3. Selecciona la rama `main` y la carpeta `/ (root)`
4. Guarda y espera unos segundos a que se publique

---

## Stack técnico

| Tecnología | Uso |
|------------|-----|
| HTML5 `<canvas>` | Generación del collage visual |
| CSS Custom Properties | Paleta de colores y temas dinámicos |
| JavaScript ES6+ | Wizard, canvas API, localStorage |
| `localStorage` | Persistencia de datos sin backend |
| `canvas.toDataURL()` | Exportación a PNG |

---

## Preguntas del cuestionario

| # | Pregunta | Impacto en el board |
|---|----------|---------------------|
| 1 | ¿Cuál es tu intención del año? | Paleta de colores dominante |
| 2 | ¿Qué habilidad o meta quieres dominar? | Texto central principal |
| 3 | ¿Qué hábito quieres integrar? | Iconos que orbitan el centro |
| 4 | ¿Qué lugar o experiencia quieres vivir? | Patrón de fondo (ondas, montañas, etc.) |
| 5 | ¿Qué palabra define tu energía? | Frase de cierre en la parte inferior |

---

*Hecho con 💜 — Vanilla JS, cero dependencias.*
