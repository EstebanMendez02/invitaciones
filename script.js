  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre') || ''; // No asignar 'Invitado' por defecto aquí para validación
    const pases = params.get('pases') || '';   // No asignar '0' por defecto aquí para validación

    const mensajeBienvenida = document.querySelector(".mensaje-invitado");
    if (mensajeBienvenida) {
        // Muestra el nombre y pases si existen en la URL, de lo contrario, deja un mensaje genérico
        if (nombre && pases) {
             mensajeBienvenida.innerHTML = `¡Hola, <strong>${nombre}</strong>!<br>Tienes asignados <strong>${pases}</strong> pase(s).`;
        } else {
             mensajeBienvenida.innerHTML = `¡Hola!<br>Por favor, usa el enlace de invitación completo.`;
        }
    }

    const whatsappButton = document.getElementById('whatsappButton');
    if (whatsappButton) {
        // Deshabilita el botón si no hay nombre o pases en la URL para evitar confirmaciones incompletas
        if (!nombre || !pases) {
            whatsappButton.disabled = true;
            whatsappButton.textContent = "Faltan datos en la URL para confirmar";
            return; // Salir de la función si no hay datos
        }

        const mensajeWhatsApp = `Confirmo mi asistencia a los XV de Sofia. Soy ${nombre} y tengo ${pases} pases.`;
        const mensajeURLCodificado = encodeURIComponent(mensajeWhatsApp);
        const whatsappLink = `https://wa.me/+5218116611984?text=${mensajeURLCodificado}`;

        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwMngei0mui95skKNVop9kzvuvr44a6AKLI998CTnFKTLeV5OJmoa5pZNcI7iY4VrNw/exec'; // <--- ¡IMPORTANTE! Tu URL de Apps Script

        whatsappButton.onclick = async () => { // Usamos 'async' para poder usar 'await'

            // Deshabilita el botón temporalmente para evitar múltiples clics
            whatsappButton.disabled = true;
            const originalText = whatsappButton.textContent;
            whatsappButton.textContent = "Confirmando...";

            try {
                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    // mode: 'cors', // Modo por defecto, que permite leer la respuesta
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre: nombre,
                        pases: pases
                    })
                });

                const result = await response.json(); // Lee la respuesta JSON del Apps Script

                if (result.success) {
                    alert('¡Confirmación exitosa! ' + result.message);
                    // Abre WhatsApp solo si la confirmación fue exitosa en la hoja
                    window.open(whatsappLink, '_blank');
                    whatsappButton.textContent = "Confirmado y WhatsApp Abierto";
                    // Podrías deshabilitar el botón permanentemente si ya confirmó
                } else {
                    alert('Error en la confirmación: ' + result.message);
                    console.error('Error del Apps Script:', result.message);
                    whatsappButton.textContent = originalText; // Restaurar texto si hubo error
                    whatsappButton.disabled = false; // Habilitar de nuevo para reintentar
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
