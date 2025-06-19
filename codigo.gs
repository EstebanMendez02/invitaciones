const REGISTRO_SHEET_NAME = 'Registro Confirmaciones';
const INVITADOS_SHEET_NAME = 'Lista Invitados';
const SPREADSHEET_ID = '1FeyAsTgpz5vxCUJhu6P70WYJB-Qao_PKZ6y3xQVjTAQ'; // <--- ¡IMPORTANTE! Tu ID de Google Sheet

// Cambiamos doPost a doGet
function doGet(e) {
  // Ahora los datos vienen en e.parameter (para peticiones GET)
  if (e && e.parameter && e.parameter.data) {
    // Los datos vienen como una cadena JSON dentro del parámetro 'data'
    const data = JSON.parse(e.parameter.data);

    const nombreInvitado = data.nombre ? data.nombre.trim() : '';
    const pasesAsignados = parseInt(data.pases, 10);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const invitadosSheet = ss.getSheetByName(INVITADOS_SHEET_NAME);
    if (!invitadosSheet) {
      Logger.log('Error: La hoja de Lista Invitados no fue encontrada.');
      return createJsonResponse(false, 'Error interno: Hoja de invitados no encontrada.');
    }

    const invitadosData = invitadosSheet.getDataRange().getValues();
    const invitadosRows = invitadosData.slice(1); // Ignoramos encabezados

    let invitadoEncontrado = false;
    let filaInvitado = -1;

    for (let i = 0; i < invitadosRows.length; i++) {
      const filaActual = invitadosRows[i];
      const nombreEnLista = filaActual[0] ? String(filaActual[0]).trim() : '';
      const pasesEnLista = parseInt(filaActual[1], 10);
      const estadoEnLista = filaActual[2] ? String(filaActual[2]).trim().toUpperCase() : '';

      if (nombreEnLista === nombreInvitado && pasesEnLista === pasesAsignados) {
        if (estadoEnLista === 'PENDIENTE') {
          invitadoEncontrado = true;
          filaInvitado = i + 2; // +2 porque getValues es base 0 y slice(1) quita el encabezado
          break;
        } else if (estadoEnLista === 'CONFIRMADO') {
          Logger.log(`Intento de confirmación duplicada para: ${nombreInvitado}`);
          return createJsonResponse(false, 'Este invitado ya ha confirmado su asistencia.');
        }
      }
    }

    if (!invitadoEncontrado) {
      Logger.log(`Invitado no encontrado o pases incorrectos: ${nombreInvitado} con ${pasesAsignados} pases.`);
      return createJsonResponse(false, 'Invitado no encontrado o número de pases incorrecto.');
    }

    // Marcar al invitado como CONFIRMADO en la Lista Invitados
    invitadosSheet.getRange(filaInvitado, 3).setValue('CONFIRMADO');

    // Registrar la confirmación en la hoja de registro
    const registroSheet = ss.getSheetByName(REGISTRO_SHEET_NAME);
    if (!registroSheet) {
      Logger.log('Error: La hoja de Registro de Confirmaciones no fue encontrada.');
      return createJsonResponse(false, 'Error interno: Hoja de registro no encontrada.');
    }
    const fechaConfirmacion = new Date();
    registroSheet.appendRow([nombreInvitado, pasesAsignados, fechaConfirmacion]);

    // Retornar éxito
    return createJsonResponse(true, 'Asistencia confirmada y registrada exitosamente.');

  } else {
    // No se recibieron datos GET válidos
    return createJsonResponse(false, 'No se recibieron datos de confirmación.');
  }
}

// Función auxiliar para crear respuestas JSON
function createJsonResponse(success, message) {
  // Esto es crucial para CORS en GET: permite acceso desde cualquier origen
  return ContentService.createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON)
    .setMimeType(ContentService.MimeType.TEXT); // Algunos navegadores necesitan TEXT para GET/JSONP
}