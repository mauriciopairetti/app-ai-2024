
// Seleccionamos el botón de alternancia y el icono
const toggleButton = document.getElementById('toggle-dark-mode');
const toggleIcon = document.getElementById('toggle-icon');
const body = document.body;

// Verifica el estado guardado en localStorage
if (localStorage.getItem('dark-mode') === 'enabled') {
    body.classList.add('dark-mode');
    toggleIcon.classList.replace('bx-sun', 'bx-moon'); // Cambia el icono al cargar
}

// Evento para alternar el modo oscuro
toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode'); // Alterna la clase 'dark-mode'

    // Cambia el icono según el modo
    if (body.classList.contains('dark-mode')) {
        toggleIcon.classList.replace('bx-sun', 'bx-moon'); // Cambia a icono de luna
        localStorage.setItem('dark-mode', 'enabled'); // Guardar estado en localStorage
    } else {
        toggleIcon.classList.replace('bx-moon', 'bx-sun'); // Cambia a icono de sol
        localStorage.setItem('dark-mode', 'disabled'); // Guardar estado en localStorage
    }
});
