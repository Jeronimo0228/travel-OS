// Funciones que se pueden apagar desde el entorno del proyecto web (NEXT_PUBLIC_*=false).
// HU-35: el API ya entrega edición de itinerario y subida de documentos, por eso
// quedan encendidas por defecto.
const enabled = (value: string | undefined) => value !== "false";

export const features = {
  itineraryEdit: enabled(process.env.NEXT_PUBLIC_FEATURE_ITINERARY_EDIT),
  documentUpload: enabled(process.env.NEXT_PUBLIC_FEATURE_DOCUMENT_UPLOAD),
};
