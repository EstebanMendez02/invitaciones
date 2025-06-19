document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ? String(params.get('token')).trim() : '';

    const mensajeBienvenida = document.querySelector(".mensaje-invitado");
    const whatsappButton = document.getElementById('whatsappButton');
    const originalButtonText = whatsappButton ? whatsappButton.textContent : '';

    if (!whatsappButton) {
        console.error("Botón de WhatsApp no encontrado.");
        return;
    }

    if (!token) {
        whatsappButton.disabled = true;
        whatsappButton.textContent = "Enlace de invitación no válido.";
        if (mensajeBienvenida) {
            mensajeBienvenida.innerHTML = `¡Hola!<br>Por favor, usa el enlace de invitación completo y válido.`;
        }
        return;
    }

    // --- Lógica principal con google.script.run ---
    // 1. Mostrar estado inicial de carga
    whatsappButton.disabled = true;
    whatsappButton.textContent = "Cargando invitación...";
    if (mensajeBienvenida) {
        mensajeBienvenida.textContent = "Verificando tu invitación...";
    }

    // 2. Definir manejadores de éxito y fallo para google.script.run
    //    y hacer la primera llamada a Apps Script para validar/obtener datos
    google.script.run
        .withSuccessHandler(function(result) {
            // Este bloque se ejecuta si la función de Apps Script devuelve un resultado
            // y la llamada es exitosa (no hay errores de comunicación)
            const nombreInvitado = result.data ? result.data.nombre || 'Invitado' : 'Invitado';
            const pasesAsignados = result.data ? result.data.pases || '0' : '0';

            if (mensajeBienvenida) {
                mensajeBienvenida.innerHTML = `¡Hola, <strong>${nombreInvitado}</strong>!<br>Tienes asignados <strong>${pasesAsignados}</strong> pase(s).`;
            }

            if (result.success) {
                // El Apps Script indicó que la operación lógica fue exitosa
                if (result.message && result.message.includes("Ya has confirmado")) {
                    // Si el invitado ya había confirmado
                    whatsappButton.textContent = "ASISTENCIA YA CONFIRMADA";
                    whatsappButton.disabled = true;
                    whatsappButton.style.backgroundColor = '#FFC107'; // Color de advertencia
                    whatsappButton.style.cursor = 'not-allowed';
                    alert(result.message); // Muestra el mensaje informativo del servidor
                } else {
                    // Invitación pendiente y válida
                    whatsappButton.textContent = originalButtonText;
                    whatsappButton.disabled = false;

                    // Asignar el evento click al botón de WhatsApp
                    whatsappButton.onclick = function() {
                        whatsappButton.disabled = true;
                        whatsappButton.textContent = "Confirmando...";

                        // Segunda llamada a Apps Script para la confirmación final
                        google.script.run
                            .withSuccessHandler(function(confirmResult) {
                                if (confirmResult.success) {
                                    alert('¡Confirmación exitosa! ' + confirmResult.message);
                                    const mensajeWhatsApp = `Confirmo mi asistencia a los XV de Sofia. Soy ${nombreInvitado} y tengo ${pasesAsignados} pases.`;
                                    const mensajeURLCodificado = encodeURIComponent(mensajeWhatsApp);
                                    const whatsappLink = `https://wa.me/+5218116611984?text=${mensajeURLCodificado}`; // Asegúrate de que este número sea el correcto
                                    window.open(whatsappLink, '_blank');
                                    whatsappButton.textContent = "ASISTENCIA CONFIRMADA";
                                    whatsappButton.style.backgroundColor = '#4CAF50';
                                    whatsappButton.style.cursor = 'not-allowed';
                                } else {
                                    alert('Error al confirmar: ' + confirmResult.message);
                                    console.error('Error del Apps Script (confirmación):', confirmResult.message);
                                    whatsappButton.textContent = originalButtonText;
                                    whatsappButton.disabled = false;
                                }
                            })
                            .withFailureHandler(function(error) {
                                console.error('Error de comunicación con Apps Script (confirmación):', error);
                                alert('Ocurrió un error inesperado al intentar confirmar. Por favor, inténtalo de nuevo.');
                                whatsappButton.textContent = originalButtonText;
                                whatsappButton.disabled = false;
                            })
                            .processInvitation(token); // Llama a la función processInvitation de Apps Script
                    };
                }
            } else {
                // El Apps Script indicó que la operación lógica falló (ej. token inválido)
                if (mensajeBienvenida) {
                    mensajeBienvenida.innerHTML = `Lo sentimos.<br>${result.message}`;
                }
                whatsappButton.textContent = "Enlace no válido";
                whatsappButton.disabled = true;
                whatsappButton.style.backgroundColor = '#F44336'; // Rojo para error
                whatsappButton.style.cursor = 'not-allowed';
                alert('Error: ' + result.message);
            }
        })
        .withFailureHandler(function(error) {
            // Este bloque se ejecuta si hay un problema técnico al comunicarse con Apps Script
            console.error('Error al comunicarse con Google Apps Script (inicial):', error);
            alert('No se pudo verificar la invitación. Por favor, revisa tu conexión a internet o el despliegue del script.');
            if (mensajeBienvenida) {
                mensajeBienvenida.innerHTML = `Error al cargar.<br>Por favor, revisa tu conexión o el script.`;
            }
            whatsappButton.textContent = "Error al cargar";
            whatsappButton.disabled = true;
            whatsappButton.style.backgroundColor = '#F44336';
            whatsappButton.style.cursor = 'not-allowed';
        })
        .processInvitation(token); // Esta es la PRIMERA LLAMADA a la función processInvitation en Apps Script

    // --- Código para las animaciones reveal (déjalo tal cual) ---
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
