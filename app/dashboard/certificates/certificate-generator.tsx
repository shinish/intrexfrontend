// app/dashboard/certificates/generate/page.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Certificate } from '@/components/certificate/certificate'
import { Download, Printer, ImageDown, FileDown } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function CertificateGeneratorPage() {
  const certificateRef = useRef<HTMLDivElement>(null)
  
  // Default data - in real app, this would come from the registration
  const certificateData = {
    registrationNumber: 'TR-2025-00001',
    traineeName: 'Shamim',
    civilId: '123456789',
    empId: 'EMP001',
    companyName: 'FISS',
    topicName: 'Doosn Orivel',
    trainingDate: '12-06-2026',
    validityDate: '05-08-2027',
    intrexOfficialName: 'INTREX Official Name',
    instructorName: 'Instructor Name',
    certificateNumber: 'IICTCMH2025-00001.1.9f3fca',
    qrCodeUrl: 'https://example.com/verify/123'
  }
  
  const downloadAsPng = async () => {
    if (!certificateRef.current) return
    
    try {
      // Ensure the background image is loaded before capturing
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 5000,
        // Force all images to be included
        foreignObjectRendering: true,
      })
      
      const link = document.createElement('a')
      link.download = `certificate-${certificateData.registrationNumber}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating certificate image:', error)
    }
  }
  
  const downloadAsPdf = async () => {
    if (!certificateRef.current) return
    
    try {
      // Create high-quality canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 5000,
        foreignObjectRendering: true,
      })
      
      // Calculate dimensions for PDF
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const imgData = canvas.toDataURL('image/png')
      
      // Create PDF with appropriate dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight]
      })
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
      pdf.save(`certificate-${certificateData.registrationNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }
  
  const printCertificate = () => {
    // Create a print window with just the certificate
    const printWindow = window.open('', '_blank')
    if (printWindow && certificateRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate</title>
            <style>
              @media print {
                @page {
                  size: landscape;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                #certificate-container {
                  width: 100vw;
                  height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
              }
            </style>
          </head>
          <body>
            <div id="certificate-container">
              ${certificateRef.current.outerHTML}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      
      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificate Generator</h1>
            <p className="text-gray-600 mt-1">Registration: {certificateData.registrationNumber}</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={printCertificate}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={downloadAsPdf}>
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={downloadAsPng}>
              <ImageDown className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
          </div>
        </div>
        
        {/* Certificate Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-lg font-semibold mb-4">Certificate Preview</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div ref={certificateRef}>
                <Certificate {...certificateData} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>The certificate includes the background image and all content. PDF and PNG exports will maintain the full design.</p>
        </div>
      </div>
    </div>
  )
}