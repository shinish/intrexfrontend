'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function RegistrationsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the registrations list view
    router.push('/dashboard/registrations/list')
  }, [router])
  
  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Watermark Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image 
          src="/images/watermark.png" 
          alt="Watermark" 
          layout="fill" 
          objectFit="contain"
          className="opacity-20"
        />
      </div>
      
      <div className="flex items-center relative z-10">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffe000]" />
        <span className="ml-2 text-black">Redirecting to registrations list...</span>
      </div>
    </div>
  )
}