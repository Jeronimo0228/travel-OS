// Features whose backend endpoints are specified but not delivered yet.
// NEXT_PUBLIC_* values are inlined at build time: set them in the web
// project's environment and redeploy once the API supports the feature.
const enabled = (value: string | undefined) => value === "true";

export const features = {
  itineraryEdit: enabled(process.env.NEXT_PUBLIC_FEATURE_ITINERARY_EDIT),
  documentUpload: enabled(process.env.NEXT_PUBLIC_FEATURE_DOCUMENT_UPLOAD),
};
