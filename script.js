  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre') ? decodeURIComponent(params.get('nombre').replace(/\+/g, ' ')) : ''; // Decodificar correctamente espacios
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

        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzqDRwSmGHL0o16V4IjKRWVIKX1RPx9pcChsfKMPMKAq3weUzd7SEfTewu2i55kPg3U/exec'; // <--- ¡Tu URL actual de Apps Script!

        whatsappButton.onclick = async () => {
            whatsappButton.disabled = true;
            const originalText = whatsappButton.textContent;
            whatsappButton.textContent = "Confirmando...";

            try {
                // Preparamos los datos para enviarlos en la URL
                const dataToSend = {
                    nombre: nombre,
                    pases: pases
                };
                // Convertimos el objeto a una cadena JSON y la codificamos para la URL
                const encodedData = encodeURIComponent(JSON.stringify(dataToSend));
                // Construimos la URL de la petición GET con los datos como parámetro 'data'
                const requestUrl = `${WEB_APP_URL}?data=${encodedData}`;

                const response = await fetch(requestUrl, {
                    method: 'GET', // Cambiamos el método a GET
                    // No necesitamos headers ni body para GET con query params
                });

                const result = await response.json(); // Leemos la respuesta JSON

                if (result.success) {
                    alert('¡Confirmación exitosa! ' + result.message);
                    window.open(whatsappLink, '_blank');
                    whatsappButton.textContent = "Confirmado y WhatsApp Abierto";
                    // Puedes añadir aquí lógica para deshabilitar el botón permanentemente
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
