function getParams() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ? String(params.get('token')).trim() : ''; // Ahora buscamos el 'token'

    const mensajeBienvenida = document.querySelector(".mensaje-invitado");
    const whatsappButton = document.getElementById('whatsappButton');
    const originalButtonText = whatsappButton ? whatsappButton.textContent : '';

    if (!whatsappButton) {
        console.error("Botón de WhatsApp no encontrado.");
        return;
    }

    if (!token) {
        // Si no hay token, el botón se deshabilita y se muestra un mensaje genérico.
        whatsappButton.disabled = true;
        whatsappButton.textContent = "Enlace de invitación no válido.";
        if (mensajeBienvenida) {
            mensajeBienvenida.innerHTML = `¡Hola!<br>Por favor, usa el enlace de invitación completo y válido.`;
        }
        return; // Salimos de la función si no hay token
    }

    // Al cargar la página, se intenta validar el token y obtener los datos
    // para mostrar el mensaje de bienvenida
    (async () => { // Usamos una IIFE (Immediately Invoked Function Expression) asíncrona
        whatsappButton.disabled = true; // Deshabilita el botón mientras se valida el token
        whatsappButton.textContent = "Cargando invitación...";
        if (mensajeBienvenida) {
            mensajeBienvenida.textContent = "Verificando tu invitación...";
        }

        try {
            const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwMngei0mui95skKNVop9kzvuvr44a6AKLI998CTnFKTLeV5OJmoa5pZNcI7iY4VrNw/exec'; // ¡TU URL de Apps Script!
            const requestUrl = `${WEB_APP_URL}?token=${encodeURIComponent(token)}`; // Enviamos solo el token

            const response = await fetch(requestUrl, {
                method: 'GET',
            });

            const result = await response.json(); // Leemos la respuesta JSON

            if (result.success) {
                const nombreInvitado = result.data.nombre || 'Invitado';
                const pasesAsignados = result.data.pases || '0';

                if (mensajeBienvenida) {
                    mensajeBienvenida.innerHTML = `¡Hola, <strong>${nombreInvitado}</strong>!<br>Tienes asignados <strong>${pasesAsignados}</strong> pase(s).`;
                }

                // Si ya estaba confirmado (pero result.success es true), mostrarlo y deshabilitar
                if (result.message.includes("Ya has confirmado")) {
                    whatsappButton.textContent = "ASISTENCIA YA CONFIRMADA";
                    whatsappButton.disabled = true;
                    whatsappButton.style.backgroundColor = '#FFC107'; // Color de advertencia
                    whatsappButton.style.cursor = 'not-allowed';
                    alert(result.message); // Muestra el mensaje informativo del servidor
                } else {
                    // Si es una invitación pendiente y válida, habilitar el botón de confirmar
                    whatsappButton.textContent = originalButtonText; // Restaura el texto original
                    whatsappButton.disabled = false;

                    // Adjuntar el evento click del botón SOLAMENTE si el token es válido y pendiente
                    whatsappButton.onclick = async () => {
                        whatsappButton.disabled = true;
                        whatsappButton.textContent = "Confirmando...";

                        try {
                            // Re-hacemos la misma petición GET al Apps Script,
                            // porque la primera fue para "validar y obtener datos",
                            // y esta segunda es para "confirmar y registrar"
                            // El script de Apps Script ya sabe que si el token es pendiente, lo confirmará.
                            const confirmResponse = await fetch(requestUrl, { // Usamos la misma URL
                                method: 'GET',
                            });
                            const confirmResult = await confirmResponse.json();

                            if (confirmResult.success) {
                                alert('¡Confirmación exitosa! ' + confirmResult.message);
                                const mensajeWhatsApp = `Confirmo mi asistencia a los XV de Sofia. Soy ${nombreInvitado} y tengo ${pasesAsignados} pases.`;
                                const mensajeURLCodificado = encodeURIComponent(mensajeWhatsApp);
                                const whatsappLink = `https://wa.me/+5218116611984?text=${mensajeURLCodificado}`;
                                window.open(whatsappLink, '_blank');
                                whatsappButton.textContent = "ASISTENCIA CONFIRMADA";
                                whatsappButton.style.backgroundColor = '#4CAF50';
                                whatsappButton.style.cursor = 'not-allowed';
                            } else {
                                alert('Error al confirmar: ' + confirmResult.message);
                                console.error('Error del Apps Script:', confirmResult.message);
                                whatsappButton.textContent = originalButtonText;
                                whatsappButton.disabled = false;
                            }
                        } catch (confirmError) {
                            console.error('Error al enviar la confirmación:', confirmError);
                            alert('Ocurrió un error inesperado al intentar confirmar. Por favor, inténtalo de nuevo.');
                            whatsappButton.textContent = originalButtonText;
                            whatsappButton.disabled = false;
                        }
                    };
                }

            } else {
                // Si el Apps Script devuelve success: false (token no encontrado/inválido)
                if (mensajeBienvenida) {
                    mensajeBienvenida.innerHTML = `Lo sentimos.<br>${result.message}`;
                }
                whatsappButton.textContent = "Enlace no válido";
                whatsappButton.disabled = true;
                whatsappButton.style.backgroundColor = '#F44336'; // Color rojo para error
                whatsappButton.style.cursor = 'not-allowed';
                alert('Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error de red o procesamiento:', error);
            alert('No se pudo verificar la invitación. Por favor, revisa tu conexión a internet e inténtalo de nuevo.');
            if (mensajeBienvenida) {
                mensajeBienvenida.innerHTML = `Error al cargar.<br>Por favor, revisa tu conexión.`;
            }
            whatsappButton.textContent = "Error al cargar";
            whatsappButton.disabled = true;
        }
    })(); // Invocamos la función asíncrona inmediatamente
}

document.addEventListener("DOMContentLoaded", function () {
    getParams();

    // ... (Tu código para las animaciones reveal) ...
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
