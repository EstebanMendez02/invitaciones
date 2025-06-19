function getParams() {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre') ? decodeURIComponent(params.get('nombre').replace(/\+/g, ' ')) : '';
    const pases = params.get('pases') || '';

    const mensajeBienvenida = document.querySelector(".mensaje-invitado");
    if (mensajeBienvenida) {
        if (nombre && pases) {
             mensajeBienvenida.innerHTML = `¡Hola, <strong>${nombre}</strong>!<br>Tienes asignados <strong>${pases}</strong> pase(s).`;
        } else {
             mensajeBienvenida.innerHTML = `¡Hola!<br>Por favor, usa el enlace de invitación completo.`;
        }
    }

    const whatsappButton = document.getElementById('whatsappButton');
    if (whatsappButton) {
        if (!nombre || !pases) {
            whatsappButton.disabled = true;
            whatsappButton.textContent = "Faltan datos en la URL para confirmar";
            return;
        }

        const mensajeWhatsApp = `Confirmo mi asistencia a los XV de Sofia. Soy ${nombre} y tengo ${pases} pases.`;
        const mensajeURLCodificado = encodeURIComponent(mensajeWhatsApp);
        const whatsappLink = `https://wa.me/?text=${mensajeURLCodificado}`;

        // Asegúrate de que esta URL sea la correcta de tu despliegue de Apps Script
        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyvdB5-Bn-hpP7njI1F_y-MKV6yvvZ-_bo0VJY5Oxx8ML1p0NSnKbftGLDykiYjO-Ql/exec'; // <--- ¡Tu URL actual de Apps Script!

        whatsappButton.onclick = async () => {
            whatsappButton.disabled = true; // Deshabilita al inicio de la acción
            const originalText = whatsappButton.textContent; // Guarda el texto original
            whatsappButton.textContent = "Confirmando..."; // Muestra un mensaje de carga

            try {
                const dataToSend = {
                    nombre: nombre,
                    pases: pases
                };
                const encodedData = encodeURIComponent(JSON.stringify(dataToSend));
                const requestUrl = `${WEB_APP_URL}?data=${encodedData}`;

                const response = await fetch(requestUrl, {
                    method: 'GET',
                });

                const result = await response.json();

                if (result.success) {
                    alert('¡Confirmación exitosa! ' + result.message);
                    window.open(whatsappLink, '_blank');
                    // --- NUEVOS CAMBIOS AQUÍ ---
                    whatsappButton.textContent = "ASISTENCIA CONFIRMADA"; // Cambia el texto
                    whatsappButton.disabled = true; // Asegura que permanezca deshabilitado
                    whatsappButton.style.backgroundColor = '#4CAF50'; // Opcional: Cambia color a verde
                    whatsappButton.style.cursor = 'not-allowed'; // Opcional: Cambia cursor
                    // --- FIN NUEVOS CAMBIOS ---
                } else {
                    alert('Error en la confirmación: ' + result.message);
                    console.error('Error del Apps Script:', result.message);
                    whatsappButton.textContent = originalText; // Restaura el texto
                    whatsappButton.disabled = false; // Vuelve a habilitar para que pueda reintentar
                }

            } catch (error) {
                console.error('Error al enviar el registro o procesar la respuesta:', error);
                alert('Ocurrió un error inesperado al intentar confirmar. Por favor, inténtalo de nuevo.');
                whatsappButton.textContent = originalText;
                whatsappButton.disabled = false;
            }
        };
    }
}

document.addEventListener("DOMContentLoaded", function () {
    getParams();

    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    reveals.forEach(section => {
        observer.observe(section);
    });
});
