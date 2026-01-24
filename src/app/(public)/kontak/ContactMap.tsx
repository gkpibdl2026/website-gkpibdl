'use client'

import { GoogleMapComponent } from "@/components/ui/GoogleMapComponent";

export function ContactMap() {
  return (
    <GoogleMapComponent 
      className="h-full w-full"
      query="GKPI Bandar Lampung"
      zoom={16}
    />
  )
}
