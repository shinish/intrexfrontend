// lib/api/certificateApi.ts
import type { CertificateVerificationResponse, Certificate, CertificateGenerationRequest } from '@/lib/types/certificate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const certificateApi = {
  async verify(certificateId: string): Promise<CertificateVerificationResponse> {
    const response = await fetch(`${API_URL}/certificates/verify/${certificateId}`);
    if (!response.ok) {
      throw new Error('Failed to verify certificate');
    }
    return response.json();
  },

  async generate(data: CertificateGenerationRequest): Promise<Certificate> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/certificates/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate certificate');
    }
    return response.json();
  },

  async download(certificateId: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/certificates/${certificateId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }
    return response.blob();
  }
};