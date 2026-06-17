/**
 * NovaNous, Inc. — main.js
 * JavaScript nativo (vanilla) — sin librerías externas
 *
 * Funcionalidades:
 *   1. Modo oscuro con persistencia en localStorage
 *   2. Menú hamburguesa (móvil)
 *   3. Año actual en el footer
 *   4. Formulario de contacto con persistencia de nombre en localStorage
 *   5. Navegación jerárquica de cursos en 3 niveles (Áreas → Subcategorías → Cursos)
 *   6. Descarga de material en PDF (curso de Paleontología)
 */

/* ============================================================
   1. MODO OSCURO — Web Storage (localStorage)
   
   Por qué localStorage y no sessionStorage:
   localStorage persiste incluso al cerrar el navegador.
   sessionStorage se borra al cerrar la pestaña.
   El usuario espera que su preferencia de tema se recuerde
   entre sesiones → localStorage es la elección correcta.
   ============================================================ */

const darkModeBtn   = document.getElementById('darkModeToggle');
const darkModeLabel = darkModeBtn.querySelector('.dark-mode-label');
const darkModeIcon  = darkModeBtn.querySelector('.dark-mode-icon');

/**
 * Aplica o quita el modo oscuro en el <body>
 * y sincroniza el atributo aria-pressed del botón.
 * @param {boolean} isDark
 */
function applyDarkMode(isDark) {
  document.body.classList.toggle('dark-mode', isDark);

  // aria-pressed refleja el estado actual del toggle (WCAG 4.1.2)
  darkModeBtn.setAttribute('aria-pressed', String(isDark));
  darkModeBtn.setAttribute(
    'aria-label',
    isDark ? 'Desactivar modo oscuro' : 'Activar modo oscuro'
  );

  darkModeIcon.textContent  = isDark ? '☀️' : '🌙';
  darkModeLabel.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
}

/**
 * Lee la preferencia guardada en localStorage y la aplica.
 * Si no hay preferencia guardada, respeta la preferencia
 * del sistema operativo (prefers-color-scheme).
 */
function loadDarkModePreference() {
  const saved = localStorage.getItem('novanous-dark-mode');

  if (saved !== null) {
    // El usuario ya eligió manualmente → usamos su elección
    applyDarkMode(saved === 'true');
  } else {
    // Sin elección previa → respetar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDarkMode(prefersDark);
  }
}

// Listener del botón: guarda la nueva preferencia y la aplica
darkModeBtn.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark-mode');
  applyDarkMode(isDark);
  // Persistencia: guarda en localStorage
  localStorage.setItem('novanous-dark-mode', String(isDark));
});

// Aplicar preferencia al cargar la página
loadDarkModePreference();


/* ============================================================
   2. MENÚ HAMBURGUESA (móvil)
   ============================================================ */

const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  // aria-expanded informa al lector de pantalla si el menú está abierto
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute(
    'aria-label',
    isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
  );
});

// Cerrar el menú si el usuario hace clic en un enlace de navegación
mainNav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  });
});

// Cerrar menú si se hace clic fuera de él
document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});


/* ============================================================
   3. AÑO ACTUAL EN EL FOOTER
   ============================================================ */

const yearSpan = document.getElementById('currentYear');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}


/* ============================================================
   4. FORMULARIO DE CONTACTO
   Persistencia del nombre del usuario con localStorage
   ============================================================ */

const contactForm    = document.getElementById('contactForm');
const nameInput      = document.getElementById('contactName');
const formSuccess    = document.getElementById('formSuccess');

const STORAGE_KEY_NAME = 'novanous-contact-name';

// Al cargar la página: recuperar el nombre guardado
if (nameInput) {
  const savedName = localStorage.getItem(STORAGE_KEY_NAME);
  if (savedName) {
    nameInput.value = savedName;
  }

  // Guardar el nombre cada vez que el usuario lo modifica
  nameInput.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY_NAME, nameInput.value.trim());
  });
}

// Manejo del envío del formulario
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccess.hidden = false;
    contactForm.hidden = true;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ============================================================
   5. NAVEGACIÓN JERÁRQUICA DE CURSOS (3 NIVELES)

   Nivel 1 (#level1): Áreas principales
                       (Ciencia y Filosofía / Artes / Deportes)
   Nivel 2 (#level2): Subcategorías de Ciencia y Filosofía
   Nivel 3 (#level3): Cursos de Ciencias Naturales (Paleontología)

   Patrón de accesibilidad (WCAG 2.1):
     - .hidden  → display: none (oculta del DOM visual y del
                  árbol de accesibilidad)
     - .active  → nivel visible actualmente
     - aria-expanded en los botones que abren/cierran niveles
     - tabindex="-1" + .focus() en el nivel que se muestra,
       para que el foco del teclado salte ahí (navegación lógica)
   ============================================================ */

const level1 = document.getElementById('level1');
const level2 = document.getElementById('level2');
const level3 = document.getElementById('level3');

const btnLevel2  = document.getElementById('btnLevel2');  // Ver subcategorías
const btnLevel3  = document.getElementById('btnLevel3');  // Ver cursos disponibles
const btnBackTo1 = document.getElementById('btnBackTo1'); // Volver a Áreas
const btnBackTo2 = document.getElementById('btnBackTo2'); // Volver a Subcategorías

/**
 * Muestra un nivel y oculta los demás.
 * @param {HTMLElement} levelToShow - Sección de nivel a mostrar
 */
function showLevel(levelToShow) {
  [level1, level2, level3].forEach((lvl) => {
    if (lvl === levelToShow) {
      lvl.classList.remove('hidden');
      lvl.classList.add('active');
    } else {
      lvl.classList.add('hidden');
      lvl.classList.remove('active');
    }
  });

  // Sincronizar aria-expanded de los botones según el nivel mostrado
  btnLevel2.setAttribute('aria-expanded', String(levelToShow !== level1));
  btnLevel3.setAttribute('aria-expanded', String(levelToShow === level3));

  // Mover el foco al encabezado del nivel mostrado (navegación por teclado lógica)
  if (levelToShow !== level1) {
    levelToShow.setAttribute('tabindex', '-1');
    levelToShow.focus({ preventScroll: false });
  }

  levelToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Nivel 1 → Nivel 2: "Ver subcategorías" en Ciencia y Filosofía
if (btnLevel2) {
  btnLevel2.addEventListener('click', () => showLevel(level2));
}

// Nivel 2 → Nivel 3: "Ver cursos disponibles" en Ciencias Naturales
if (btnLevel3) {
  btnLevel3.addEventListener('click', () => showLevel(level3));
}

// Nivel 2 → Nivel 1: "Volver a Áreas"
if (btnBackTo1) {
  btnBackTo1.addEventListener('click', () => showLevel(level1));
}

// Nivel 3 → Nivel 2: "Volver a Subcategorías"
if (btnBackTo2) {
  btnBackTo2.addEventListener('click', () => showLevel(level2));
}


/* ============================================================
   6. DESCARGA DE PDF — Paleontología
   Si el archivo no existe aún, muestra un aviso accesible
   en lugar de un enlace roto.
   ============================================================ */

const downloadPaleo = document.getElementById('downloadPaleo');

if (downloadPaleo) {
  downloadPaleo.addEventListener('click', (e) => {
    // HEAD request: verifica si el archivo existe sin descargarlo completo
    fetch(downloadPaleo.href, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          e.preventDefault();
          alert(
            'El material del curso estará disponible muy pronto.\n' +
            'Para activarlo, coloca el archivo "paleontologia.pdf" en la carpeta /assets/ del proyecto.'
          );
        }
        // Si res.ok === true, el navegador procede con la descarga normalmente
      })
      .catch(() => {
        // fetch puede fallar bajo file:// — dejamos que el navegador
        // intente la descarga directamente (funcionará si el archivo existe)
      });
  });
}