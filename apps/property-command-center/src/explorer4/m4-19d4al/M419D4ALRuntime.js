export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AL_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_CAPABILITY_FORENSICS";
export const VERSION="4.0-m4.19d4al";

export function classifyFile(text=""){
  return {
    hasAddress:/address|streetAddress|propertyAddress|formattedAddress/i.test(text),
    hasIdentifier:/parcel|propertyId|sourcePropertyId|canonicalPropertyId|apn|identifier/i.test(text),
    hasPoint:/lat|lng|longitude|latitude|point|geometry/i.test(text),
    hasNetwork:/fetch\s*\(|https?:\/\/|request\s*\(/i.test(text),
    hasLightBox:/lightbox/i.test(text),
    hasRoute:/\/api\/lightbox\//i.test(text)
  };
}
