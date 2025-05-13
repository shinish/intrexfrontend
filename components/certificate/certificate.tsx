// components/certificate/certificate.tsx
'use client'

import React from 'react'
import Image from 'next/image'

interface CertificateProps {
  registrationNumber: string
  traineeName: string
  civilId: string
  empId: string
  companyName: string
  topicName: string
  trainingDate: string
  validityDate: string
  intrexOfficialName: string
  instructorName: string
  certificateNumber: string
  qrCodeUrl: string
  traineePhoto?: string
}

export function Certificate({
  registrationNumber,
  traineeName,
  civilId,
  empId,
  companyName,
  topicName,
  trainingDate,
  validityDate,
  intrexOfficialName,
  instructorName,
  certificateNumber,
  qrCodeUrl,
  traineePhoto
}: CertificateProps) {
  return (
    <div className="w-full max-w-[1200px] aspect-[4/3] relative overflow-hidden print:shadow-none">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/certificate-background.png"
          alt="Certificate Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 h-full">
        {/* The header (company name, logo, Arabic text) is already in the background image */}
        
        {/* Main certificate content - positioned to fit the background */}
        <div className="absolute inset-0 px-12">
          {/* Certificate title */}
          <div className="text-center mt-[200px] mb-8">
            <h2 className="text-3xl font-bold text-gray-800 tracking-wider italic">
              CERTIFICATE OF TRAINING
            </h2>
            <p className="text-lg text-gray-700 mt-2 script-font">
              Proudly Presented to
            </p>
          </div>
          
          {/* Photo placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-40 bg-gray-50 border-2 border-gray-300 rounded flex items-center justify-center overflow-hidden">
              {traineePhoto ? (
                <img src={traineePhoto} alt="Trainee" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">PHOTO</span>
              )}
            </div>
          </div>
          
          {/* Trainee details */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 script-font">
              Mr. {traineeName} (Civil ID. # {civilId} / Emp ID. # {empId})
            </h3>
            <p className="text-lg text-gray-700 mt-2 script-font">
              of {companyName}
            </p>
            <p className="text-lg text-gray-700 mt-3 script-font">
              is trained, assessed & certified in <span className="font-semibold">{topicName}</span> on {trainingDate}
            </p>
            <p className="text-lg text-yellow-600 mt-3 font-medium script-font">
              This certificate is valid up to {validityDate}
            </p>
          </div>
          
          {/* Signatures section */}
          <div className="grid grid-cols-3 gap-4 mt-12 mb-8">
            <div className="text-center">
              <div className="text-sm text-gray-700 script-font">
                &lt;&lt;Signature&gt;&gt;
              </div>
              <div className="mt-16">
                <p className="text-sm font-medium text-gray-800">{intrexOfficialName}</p>
                <p className="text-xs text-gray-600 mt-1 script-font">
                  For and on behalf of INTREX
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-700 script-font mb-2">
                &lt;&lt;Signature&gt;&gt;
              </div>
              <div className="flex justify-center mt-6">
                <div className="w-24 h-24 bg-gray-50 border-2 border-gray-300 rounded flex items-center justify-center overflow-hidden">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-gray-400 text-xs">QR</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-700 script-font">
                &lt;&lt;Signature&gt;&gt;
              </div>
              <div className="mt-16">
                <p className="text-sm font-medium text-gray-800">{instructorName}</p>
                <p className="text-xs text-gray-600 mt-1 script-font">Instructor</p>
              </div>
            </div>
          </div>
          
          {/* Certificate number */}
          <div className="text-right pr-12 absolute bottom-32 right-0">
            <p className="text-sm text-gray-700 script-font">
              Certificate No. {certificateNumber}
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .script-font {
          font-family: 'Brush Script MT', 'Lucida Handwriting', 'Brush Script Std', cursive;
          font-style: italic;
        }
        
        /* Fallback fonts for systems without Brush Script MT */
        @font-face {
          font-family: 'Brush Script MT';
          src: local('Brush Script MT'), local('BrushScriptMT');
        }
        
        @media print {
          .shadow-xl {
            box-shadow: none !important;
          }
          
          /* Ensure proper printing */
          div {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}