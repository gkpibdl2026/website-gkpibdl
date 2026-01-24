interface GoogleMapComponentProps {
  className?: string
  center?: { lat: number; lng: number }
  zoom?: number
  query?: string
  children?: React.ReactNode // Kept for compatibility but ignored
}

export function GoogleMapComponent({ 
  className = 'h-96',
  center,
  zoom = 15,
  query
}: Omit<GoogleMapComponentProps, 'children'>) {
  // Construct the embed URL
  // If query is provided, use it. Otherwise use lat/lng.
  const searchParam = query ? encodeURIComponent(query) : `${center?.lat},${center?.lng}`
  const url = `https://maps.google.com/maps?q=${searchParam}&z=${zoom}&output=embed`

  return (
    <div className={`${className} bg-gray-100 rounded-xl overflow-hidden`}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={url}
        title="Google Maps"
      ></iframe>
    </div>
  )
}
