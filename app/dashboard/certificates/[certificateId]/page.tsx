'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { generateAndDownloadCertificate, CertificateData } from '@/lib/certificatePdfGenerator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CertificateDisplayPage: React.FC = () => {
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [verification, setVerification] = useState<CertificateVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    if (params.certificateId) {
      verifyCertificate();
    }
  }, [params.certificateId]);

  const verifyCertificate = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/certificates/verify/${params.certificateId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify certificate');
      }
      
      const data: CertificateVerificationResponse = await response.json();
      setVerification(data);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificatePDF = async (): Promise<void> => {
    try {
      setDownloadingPdf(true);
      
      // Import the PDF generator dynamically
      const { generateAndDownloadCertificate } = await import('@/lib/certificatePdfGenerator');
      
      // Prepare certificate data
      const certificateData: CertificateData = {
        certificateNumber: params.certificateId as string,
        traineeName: verification?.trainee_name || '',
        civilId: verification?.trainee_id || '',
        empId: verification?.emp_id || null,
        companyName: verification?.company_name || '',
        courseName: verification?.course_title || '',
        trainingDate: formatDate(verification?.training_date),
        validityDate: formatDate(verification?.expiry_date),
        registrationNumber: verification?.registration_number || '',
        officialName: 'INTREX Official', // Get from API if available
        instructorName: 'Instructor Name', // Get from API if available
        qrCodeUrl: `${window.location.origin}/verify-certificate?certId=${params.certificateId}`,
        photo: verification?.trainee_photo || null
      };
      
      // Generate and download PDF
      await generateAndDownloadCertificate(certificateData);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Certificate Details</h1>
        <p className="text-gray-600">Certificate ID: {params.certificateId}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {verification?.is_valid ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Certificate Valid
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  Certificate Invalid
                </>
              )}
            </CardTitle>
            {verification?.is_valid && (
              <Button onClick={downloadCertificatePDF} disabled={downloadingPdf} className="flex items-center gap-2">
                {downloadingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {verification?.is_valid ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Trainee Name</label>
                <p className="text-lg">{verification.trainee_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Trainee ID</label>
                <p className="text-lg">{verification.trainee_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Company</label>
                <p className="text-lg">{verification.company_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Course Title</label>
                <p className="text-lg">{verification.course_title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Training Date</label>
                <p className="text-lg">{formatDate(verification.training_date)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                <p className="text-lg">{formatDate(verification.expiry_date) || 'No expiry'}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Registration Number</label>
                <p className="text-lg">{verification.registration_number}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Badge variant="destructive" className="mb-4">
                Invalid Certificate
              </Badge>
              <p className="text-gray-600">{verification?.error_message}</p>
              
              {verification?.trainee_name && (
                <div className="mt-6 text-sm text-gray-500">
                  <p>Certificate was issued to: {verification.trainee_name}</p>
                  {verification.course_title && <p>For course: {verification.course_title}</p>}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>This verification is provided by INTERNATIONAL INSPECTION CENTRE CO. W.L.L.</p>
        <p>For official verification, please contact the organization directly.</p>
      </div>
      
      {/* Preview Section */}
      {verification?.is_valid && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Certificate Preview</h2>
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8">
              <div className="aspect-[3/2] bg-white border border-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 p-8">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-left">
                      <div className="font-bold text-sm">INTERNATIONAL INSPECTION</div>
                      <div className="font-bold text-sm">CENTRE CO. W.L.L.</div>
                      <div className="h-1 bg-yellow-400 mt-1" style={{ width: '80px' }}></div>
                    </div>
                    
                    <div className="mx-8">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs">LOGO</span>
                      </div>
                    </div>
                    
                    <div className="text-right" dir="rtl">
                      <div className="font-bold text-sm">شركة المركز الدولي</div>
                      <div className="font-bold text-sm">للمسح والتفتيش ذ.م.م</div>
                      <div className="h-1 bg-yellow-400 mt-1 ml-auto" style={{ width: '80px' }}></div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="text-center mb-4">
                    <h1 className="text-xl font-bold">CERTIFICATE OF TRAINING</h1>
                    <div className="text-sm mt-1">Proudly Presented to</div>
                  </div>
                  
                  {/* Photo */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-24 bg-gray-200 border border-gray-400 flex items-center justify-center">
                      <span className="text-xs">PHOTO</span>
                    </div>
                  </div>
                  
                  {/* Trainee Info */}
                  <div className="text-center text-sm space-y-1">
                    <div className="font-bold">
                      Mr. {verification.trainee_name} ({verification.trainee_id})
                    </div>
                    <div>of {verification.company_name}</div>
                    <div>is trained, assessed & certified in <strong>{verification.course_title}</strong> on {formatDate(verification.training_date)}</div>
                    <div className="text-yellow-600">This certificate is valid up to {formatDate(verification.expiry_date)}</div>
                  </div>
                  
                  {/* Signatures */}
                  <div className="flex justify-between items-end mt-8">
                    <div className="text-center text-xs">
                      <div>&lt;&lt; Signature &gt;&gt;</div>
                      <div className="h-4 border-b border-gray-400 w-24 mb-1"></div>
                      <div className="font-bold">INTREX Official</div>
                      <div>For and on behalf of INTREX</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 mx-auto mb-1">
                        <div className="w-full h-full flex items-center justify-center text-xs">QR</div>
                      </div>
                      <div className="text-xs">Certificate No. {params.certificateId}</div>
                    </div>
                    
                    <div className="text-center text-xs">
                      <div>&lt;&lt; Signature &gt;&gt;</div>
                      <div className="h-4 border-b border-gray-400 w-24 mb-1"></div>
                      <div className="font-bold">Instructor Name</div>
                      <div>Instructor</div>
                    </div>
                  </div>
                  
                  {/* Footer logos */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-center items-center gap-1 flex-wrap">
                      <span className="text-xs text-gray-600 mr-2">MEMBER OF</span>
                      {['IOSH', 'NSC', 'Highfield', 'IADC', 'RIGPASS', 'BRITISH SAFETY', 'Member', 'IWCF', 'DROPS', 'GEEA'].map((logo, i) => (
                        <div key={i} className="h-4 w-10 bg-blue-600 text-white text-xs flex items-center justify-center rounded">
                          {logo}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              This is a preview. The actual certificate will include proper logos, signatures, and QR code.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDisplayPage;