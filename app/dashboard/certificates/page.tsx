'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Eye, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CertificateListPage = () => {
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, pagination]);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        skip: pagination.skip.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('is_revoked', statusFilter === 'revoked' ? 'true' : 'false');
      }

      const response = await axios.get(`${API_URL}/certificates/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      alert('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const viewCertificate = (certificateId) => {
    router.push(`/dashboard/certificates/${certificateId}`);
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/certificates/${certificateId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${certificateId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (certificate) => {
    if (certificate.is_revoked) {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    if (certificate.expiry_date && new Date(certificate.expiry_date) < new Date()) {
      return <Badge variant="warning">Expired</Badge>;
    }
    return <Badge variant="success">Valid</Badge>;
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-gray-600">Manage and view all training certificates</p>
        </div>
        <Button onClick={() => router.push('/dashboard/certificates/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Certificate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate List</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search certificates by ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Certificates</SelectItem>
                <SelectItem value="valid">Valid Only</SelectItem>
                <SelectItem value="revoked">Revoked Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Trainee ID</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading certificates...
                  </TableCell>
                </TableRow>
              ) : filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No certificates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-medium">{certificate.id}</TableCell>
                    <TableCell>{certificate.trainee_id}</TableCell>
                    <TableCell>{formatDate(certificate.issue_date)}</TableCell>
                    <TableCell>{formatDate(certificate.expiry_date)}</TableCell>
                    <TableCell>{getStatusBadge(certificate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => viewCertificate(certificate.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!certificate.is_revoked && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => downloadCertificate(certificate.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredCertificates.length} certificates
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
                disabled={pagination.skip === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
                disabled={filteredCertificates.length < pagination.limit}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateListPage;