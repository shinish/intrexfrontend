import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateData {
  certificateNumber: string;
  traineeName: string;
  civilId: string;
  empId?: string | null;
  companyName: string;
  courseName: string;
  trainingDate: string;
  validityDate: string;
  registrationNumber: string;
  officialName?: string;
  instructorName?: string;
  qrCodeUrl: string;
  photo?: string | null;
}

interface LogoInfo {
  name: string;
  color: string;
}

const generateCertificatePDF = async (certificateData: CertificateData): Promise<jsPDF> => {
  // Create new PDF document
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background watermark (if available)
  try {
    // Add watermark image if available
    const watermarkImg = new Image();
    watermarkImg.src = '/images/intrex-watermark.png';
    
    await new Promise<void>((resolve) => {
      watermarkImg.onload = () => resolve();
      watermarkImg.onerror = () => resolve(); // Continue even if image not found
    });
    
    if (watermarkImg.complete) {
      // Fix: Use the correct GState API for jsPDF
      const gState = new (pdf as any).GState({ opacity: 0.1 });
      pdf.setGState(gState);
      pdf.addImage(watermarkImg, 'PNG', pageWidth / 2 - 50, pageHeight / 2 - 25, 100, 50);
      // Reset opacity
      const resetGState = new (pdf as any).GState({ opacity: 1 });
      pdf.setGState(resetGState);
    }
  } catch (e) {
    console.log('Watermark not available', e);
  }

  // Load images
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
  };

  try {
    // Header Company Names and Logos
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    
    // Left company name
    pdf.text('INTERNATIONAL INSPECTION', 20, 20);
    pdf.text('CENTRE CO. W.L.L.', 20, 26);
    pdf.setLineWidth(1);
    pdf.setDrawColor(255, 215, 0); // Yellow
    pdf.line(20, 28, 65, 28);

    // Add INTREX logo in center
    try {
      const logoImg = await loadImage('/images/intrex-logo.png');
      pdf.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);
    } catch (e) {
      console.log('Logo not available');
    }

    // Right company name (Arabic)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('شركة المركز الدولي', pageWidth - 70, 20, { align: 'right' });
    pdf.text('للمسح والتفتيش ذ.م.م', pageWidth - 70, 26, { align: 'right' });
    pdf.line(pageWidth - 70, 28, pageWidth - 20, 28);

    // Certificate Title
    pdf.setFontSize(24);
    pdf.setFont('times', 'bold');
    pdf.text('CERTIFICATE OF TRAINING', pageWidth / 2, 60, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('times', 'normal');
    pdf.text('Proudly Presented to', pageWidth / 2, 70, { align: 'center' });

    // Photo placeholder (if photo available)
    const photoY = 80;
    const photoWidth = 25;
    const photoHeight = 32;
    
    if (certificateData.photo) {
      try {
        const photoImg = await loadImage(certificateData.photo);
        pdf.addImage(photoImg, 'JPEG', pageWidth / 2 - photoWidth / 2, photoY, photoWidth, photoHeight);
      } catch (e) {
        // Draw placeholder if photo not available
        pdf.setDrawColor(0, 0, 0);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(pageWidth / 2 - photoWidth / 2, photoY, photoWidth, photoHeight, 'F');
        pdf.rect(pageWidth / 2 - photoWidth / 2, photoY, photoWidth, photoHeight, 'S');
        pdf.setFontSize(8);
        pdf.text('PHOTO', pageWidth / 2, photoY + photoHeight / 2, { align: 'center' });
      }
    } else {
      // Draw placeholder
      pdf.setDrawColor(0, 0, 0);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(pageWidth / 2 - photoWidth / 2, photoY, photoWidth, photoHeight, 'F');
      pdf.rect(pageWidth / 2 - photoWidth / 2, photoY, photoWidth, photoHeight, 'S');
      pdf.setFontSize(8);
      pdf.text('PHOTO', pageWidth / 2, photoY + photoHeight / 2, { align: 'center' });
    }

    // Trainee Information
    pdf.setFontSize(18);
    pdf.setFont('times', 'bold');
    pdf.text(
      `Mr. ${certificateData.traineeName} (${certificateData.civilId}${certificateData.empId ? ` / ${certificateData.empId}` : ''})`,
      pageWidth / 2,
      120,
      { align: 'center' }
    );

    pdf.setFontSize(14);
    pdf.setFont('times', 'normal');
    pdf.text(`of ${certificateData.companyName}`, pageWidth / 2, 130, { align: 'center' });

    pdf.text(
      `is trained, assessed & certified in ${certificateData.courseName} on ${certificateData.trainingDate}`,
      pageWidth / 2,
      140,
      { align: 'center' }
    );

    pdf.setTextColor(200, 160, 0); // Yellow color
    pdf.text(
      `This certificate is valid up to ${certificateData.validityDate}`,
      pageWidth / 2,
      148,
      { align: 'center' }
    );
    pdf.setTextColor(0, 0, 0); // Reset to black

    // Signatures
    const sigY = 170;
    
    // Left signature
    pdf.setFontSize(10);
    pdf.text('<< Signature >>', 60, sigY);
    pdf.line(40, sigY + 5, 80, sigY + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.officialName || "INTREX Official's Name", 60, sigY + 10, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.text('For and on behalf of INTREX', 60, sigY + 15, { align: 'center' });

    // QR Code
    const qrSize = 30;
    const qrX = pageWidth / 2 - qrSize / 2;
    const qrY = sigY - 5;
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(certificateData.qrCodeUrl, {
        width: 150,
        margin: 1,
      });
      pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (e) {
      console.error('QR code generation failed', e);
    }
    
    pdf.setFontSize(8);
    pdf.text(`Certificate No. ${certificateData.certificateNumber}`, pageWidth / 2, qrY + qrSize + 5, { align: 'center' });

    // Right signature
    pdf.setFontSize(10);
    pdf.text('<< Signature >>', pageWidth - 60, sigY);
    pdf.line(pageWidth - 80, sigY + 5, pageWidth - 40, sigY + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.instructorName || 'Instructor Name', pageWidth - 60, sigY + 10, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.text('Instructor', pageWidth - 60, sigY + 15, { align: 'center' });

    // Accreditation logos at bottom
    const logoY = pageHeight - 20;
    const logoHeight = 8;
    const logoSpacing = 20;
    const totalLogoWidth = 10 * logoSpacing;
    let startX = (pageWidth - totalLogoWidth) / 2;

    try {
      const accreditationLogos = await loadImage('/images/accreditation-logos.png');
      pdf.addImage(accreditationLogos, 'PNG', startX, logoY, totalLogoWidth, logoHeight);
    } catch (e) {
      // Add individual logo placeholders
      const logosInfo: LogoInfo[] = [
        { name: 'IOSH', color: '#2563EB' },
        { name: 'NSC', color: '#3B82F6' },
        { name: 'Highfield', color: '#A855F7' },
        { name: 'IADC', color: '#EF4444' },
        { name: 'RIGPASS', color: '#22C55E' },
        { name: 'BRITISH SAFETY', color: '#DC2626' },
        { name: 'Member', color: '#6B7280' },
        { name: 'IWCF', color: '#1D4ED8' },
        { name: 'DROPS', color: '#059669' },
        { name: 'GEEA', color: '#1E40AF' }
      ];
      
      pdf.setFontSize(5);
      pdf.setTextColor(128, 128, 128);
      pdf.text('MEMBER OF', startX - 10, logoY + logoHeight / 2);
      pdf.setTextColor(255, 255, 255);
      
      logosInfo.forEach((logo, i) => {
        const x = startX + i * logoSpacing;
        pdf.setFillColor(...hexToRgb(logo.color));
        pdf.roundedRect(x, logoY, 15, logoHeight, 1, 1, 'F');
        pdf.text(logo.name, x + 7.5, logoY + logoHeight / 2 + 1, { align: 'center' });
      });
    }

  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }

  return pdf;
};

// Utility function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// Export function to be used in your React component
export const generateAndDownloadCertificate = async (certificateData: CertificateData): Promise<jsPDF> => {
  try {
    const pdf = await generateCertificatePDF(certificateData);
    
    // Add metadata
    pdf.setProperties({
      title: `Certificate ${certificateData.certificateNumber}`,
      author: 'International Inspection Centre Co. W.L.L.',
      subject: `Training Certificate for ${certificateData.traineeName}`,
      keywords: 'certificate, training, INTREX',
      creator: 'CertiTrack',
    });
    
    // Download the PDF
    pdf.save(`Certificate_${certificateData.certificateNumber}.pdf`);
    
    return pdf;
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
};

export default generateCertificatePDF;