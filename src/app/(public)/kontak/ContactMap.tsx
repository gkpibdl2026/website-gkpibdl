'use client'

import { GoogleMapComponent } from "@/components/ui/GoogleMapComponent";

interface ContactMapProps {
  mapsEmbedUrl?: string
}

export function ContactMap({ mapsEmbedUrl }: ContactMapProps) {
  // Jika ada URL embed kustom dari admin, gunakan iframe langsung
  if (mapsEmbedUrl && mapsEmbedUrl.trim() !== '') {
    return (
      <iframe
        src={mapsEmbedUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Lokasi GKPI Bandar Lampung"
      />
    )
  }

  // Fallback ke GoogleMapComponent default
  return (
    <GoogleMapComponent 
      className="h-full w-full"
      query="GKPI Bandar Lampung"
      zoom={16}
    />
  )
}
