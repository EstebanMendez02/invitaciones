const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyB99OcwK-8XxfVrxV3zmW9QAVI3IRKTGynEjJzZ-1R-uor625jwKKa7jbigk4K60X5/exec'; // <--- ¡Tu URL de despliegue de Apps Script!

async function getGuestInfoByt(t) {
    const requestUrl = `${WEB_APP_URL}?fetch_info_t=${encodeURIComponent(t)}`;
    try {
        const response = await fetch(requestUrl);
        const result = await response.json();
        if (result.success) {
            return {
                nombre: result.nombre,
                pases: result.pases,
                estado: result.estado // 'PENDIENTE' o 'CONFIRMADO'
            };
        } else {
            console.error('Error al obtener info del invitado:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Error de red al obtener info del invitado:', error);
        return null;
    }
}

async function initializeInvitationPage() {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('t') ? params.get('t').trim() : ''; // Esperamos 't' en la URL

    const mensajeBienvenida = document.querySelector(".mensaje-invitado");
    const whatsappButton = document.getElementById('whatsappButton');

    if (!t) {
        if (mensajeBienvenida) {
            mensajeBienvenida.innerHTML = `¡Hola!<br>El enlace de invitación es incorrecto o está incompleto.`;
        }
        if (whatsappButton) {
            whatsappButton.disabled = true;
            whatsappButton.textContent = "Enlace inválido";
            whatsappButton.style.backgroundColor = '#999'; // Color gris
            whatsappButton.style.cursor = 'not-allowed';
        }
        return; // Detener ejecución si no hay t
    }

    // Paso 1: Obtener la información del invitado usando el t
    const guestInfo = await getGuestInfoByt(t);

    if (!guestInfo) {
        if (mensajeBienvenida) {
            mensajeBienvenida.innerHTML = `¡Hola!<br>No pudimos encontrar tu invitación. Por favor, verifica el enlace.`;
        }
        if (whatsappButton) {
            whatsappButton.disabled = true;
            whatsappButton.textContent = "Invitación no encontrada";
            whatsappButton.style.backgroundColor = '#999';
            whatsappButton.style.cursor = 'not-allowed';
        }
        return; // Detener ejecución si no se encontró información
    }

    const { nombre, pases, estado } = guestInfo;

    if (mensajeBienvenida) {
        mensajeBienvenida.innerHTML = `¡Hola, <strong>${nombre}</strong>!<br>Tienes asignados <strong>${pases}</strong> pase(s).`;
    }

    // Configurar el botón de WhatsApp
    if (whatsappButton) {
        if (estado === 'CONFIRMADO') {
            whatsappButton.textContent = "ASISTENCIA CONFIRMADA";
            whatsappButton.disabled = true;
            whatsappButton.style.backgroundColor = '#4CAF50'; // Verde
            whatsappButton.style.cursor = 'not-allowed';
            return; // No configurar el onclick si ya está confirmado
        }

        const mensajeWhatsApp = `Confirmo mi asistencia a los XV de Sofia. Soy ${nombre} y tengo ${pases} pases.`;
        const whatsappLink = `https://wa.me/528311103028?text=${encodeURIComponent(mensajeWhatsApp)}`;

        whatsappButton.onclick = async () => {
            whatsappButton.disabled = true;
            const originalText = whatsappButton.textContent;
            whatsappButton.textContent = "Confirmando...";

            try {
                // Paso 2: Enviar el t para la confirmación
                const requestUrl = `${WEB_APP_URL}?t=${encodeURIComponent(t)}`; // Solo enviamos el t

                const response = await fetch(requestUrl, {
                    method: 'GET', // Usamos GET como tu configuración actual
                });

                const result = await response.json();

                if (result.success) {
                    alert('¡Confirmación exitosa! ' + result.message);
                    window.open(whatsappLink, '_blank');
                    whatsappButton.textContent = "ASISTENCIA CONFIRMADA";
                    whatsappButton.disabled = true;
                    whatsappButton.style.backgroundColor = '#4CAF50';
                    whatsappButton.style.cursor = 'not-allowed';
                } else {
                    alert('Error en la confirmación: ' + result.message);
                    console.error('Error del Apps Script:', result.message);
                    whatsappButton.textContent = originalText;
                    whatsappButton.disabled = false;
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
    initializeInvitationPage(); // Llama a la nueva función de inicialización

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
