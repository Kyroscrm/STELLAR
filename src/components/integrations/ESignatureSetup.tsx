
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Pen, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDocumentSignature } from '@/hooks/useDocumentSignature';

const ESignatureSetup = () => {
  const { documents, loading, createDocument, signDocument, updateDocumentStatus } = useDocumentSignature();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [signingDocument, setSigningDocument] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formData, setFormData] = useState({
    document_name: '',
    document_url: '',
    signer_email: '',
    signer_name: '',
    expires_at: '',
    metadata: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createDocument({
      ...formData,
      status: 'pending' as const,
      expires_at: formData.expires_at || null,
      signer_name: formData.signer_name || null
    });
    if (result) {
      setShowCreateForm(false);
      setFormData({
        document_name: '',
        document_url: '',
        signer_email: '',
        signer_name: '',
        expires_at: '',
        metadata: {}
      });
    }
  };

  const startSigning = (documentId: string) => {
    setSigningDocument(documentId);
  };

  const saveSignature = async () => {
    if (!canvasRef.current || !signingDocument) return;
    
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    
    const result = await signDocument(signingDocument, signatureData);
    if (result) {
      setSigningDocument(null);
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Simple signature pad functionality
  const setupSignaturePad = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const startDrawing = (e: MouseEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
  };

  React.useEffect(() => {
    if (canvasRef.current && signingDocument) {
      setupSignaturePad(canvasRef.current);
    }
  }, [signingDocument]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document E-Signature</h2>
          <p className="text-gray-600">Manage document signatures and contracts</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Document
        </Button>
      </div>

      {/* Create Document Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Document for Signing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_name">Document Name</Label>
                  <Input
                    id="document_name"
                    value={formData.document_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
                    placeholder="Contract, Agreement, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="document_url">Document URL</Label>
                  <Input
                    id="document_url"
                    value={formData.document_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_url: e.target.value }))}
                    placeholder="https://example.com/document.pdf"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signer_email">Signer Email</Label>
                  <Input
                    id="signer_email"
                    type="email"
                    value={formData.signer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, signer_email: e.target.value }))}
                    placeholder="signer@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signer_name">Signer Name</Label>
                  <Input
                    id="signer_name"
                    value={formData.signer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, signer_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Document</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Signature Modal */}
      {signingDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pen className="h-5 w-5" />
              Sign Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Please sign in the area below:</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="border border-gray-200 rounded bg-white cursor-crosshair w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveSignature}>Save Signature</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx && canvasRef.current) {
                      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                  }}
                >
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setSigningDocument(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading documents...</div>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents created yet</p>
                <p className="text-sm">Create your first document for e-signature</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(document.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{document.document_name}</span>
                        <Badge className={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Signer: {document.signer_name || document.signer_email}
                      </p>
                      {document.signed_at && (
                        <p className="text-sm text-green-600">
                          Signed: {new Date(document.signed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {document.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startSigning(document.id)}
                      >
                        <Pen className="h-4 w-4 mr-1" />
                        Sign
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={document.document_url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                    {document.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDocumentStatus(document.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ESignatureSetup;
