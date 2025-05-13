'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CertificateNewPage = () => {
  const router = useRouter();
  const [trainees, setTrainees] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch trainees and registrations separately for better error handling
      let traineesData = [];
      let registrationsData = [];

      try {
        const traineesRes = await axios.get(`${API_URL}/trainees/`, { headers });
        traineesData = Array.isArray(traineesRes.data) ? traineesRes.data : [];
        console.log('Trainees:', traineesData);
      } catch (traineeError) {
        console.error('Error fetching trainees:', traineeError);
        setError('Failed to load trainees');
      }

      try {
        const registrationsRes = await axios.get(`${API_URL}/training-registrations/`, { headers });
        registrationsData = Array.isArray(registrationsRes.data) ? registrationsRes.data : [];
        console.log('Registrations:', registrationsData);
      } catch (registrationError) {
        console.error('Error fetching registrations:', registrationError);
        setError(prev => prev ? `${prev} and registrations` : 'Failed to load registrations');
      }

      setTrainees(traineesData);
      setRegistrations(registrationsData);

      if (traineesData.length === 0 && registrationsData.length === 0) {
        setError('No trainees or registrations found');
      }
    } catch (error) {
      console.error('General error:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      setLoading(true);
      
      // Validate form data
      if (!selectedTrainee || !selectedRegistration) {
        alert('Please select both trainee and registration');
        return;
      }
      
      // Get the token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      // Make the API call
      const response = await axios.post(
        `${API_URL}/certificates/generate`,
        {
          trainee_id: Number(selectedTrainee),
          training_registration_id: Number(selectedRegistration)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle successful response
      if (response.data) {
        alert('Certificate generated successfully!');
        
        // Navigate to certificate verification page
        router.push(`/dashboard/certificates/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        if (error.response.data.detail === "Trainee not found") {
          alert('Trainee not found');
        } else if (error.response.data.detail === "Training registration not found") {
          alert('Training registration not found');
        } else {
          alert('Resource not found');
        }
      } else if (error.response?.status === 400) {
        if (error.response.data.detail === "A valid certificate already exists for this trainee and training registration") {
          alert('Certificate already exists for this trainee and training');
        } else {
          alert(error.response.data.detail || 'Invalid request data');
        }
      } else if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        alert('Failed to generate certificate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl bg-red-50">
          <CardContent className="p-6">
            <h2 className="text-red-800 font-bold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" onClick={fetchInitialData}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Generate Certificate</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Certificate Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="trainee">Select Trainee</Label>
            <Select value={selectedTrainee} onValueChange={setSelectedTrainee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a trainee" />
              </SelectTrigger>
              <SelectContent>
                {trainees.length === 0 ? (
                  <SelectItem value="" disabled>
                    No trainees available
                  </SelectItem>
                ) : (
                  trainees.map((trainee) => (
                    <SelectItem key={trainee.id} value={String(trainee.id)}>
                      {trainee.name || 'Unnamed Trainee'} ({trainee.civil_id || 'No ID'})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration">Select Training Registration</Label>
            <Select value={selectedRegistration} onValueChange={setSelectedRegistration}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a registration" />
              </SelectTrigger>
              <SelectContent>
                {registrations.length === 0 ? (
                  <SelectItem value="" disabled>
                    No registrations available
                  </SelectItem>
                ) : (
                  registrations.map((registration) => (
                    <SelectItem key={registration.id} value={String(registration.id)}>
                      {registration.registration_number || 'No number'} - {registration.training_course?.title || 'Unknown Course'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCertificate} 
              disabled={loading || trainees.length === 0 || registrations.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Certificate'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateNewPage;