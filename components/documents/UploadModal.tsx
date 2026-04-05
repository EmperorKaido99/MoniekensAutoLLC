'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import type { DocumentType } from '@/types/document';
import { Upload, FileText, Camera, AlertCircle } from 'lucide-react';

interface Props {
  open:    boolean;
  onClose: () => void;
  userId:  string;
}

type Step = 'choose' | 'metadata';

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'car_title',    label: 'Car Title' },
  { value: 'deed_of_sale', label: 'Deed of Sale' },
  { value: 'invoice',      label: 'Invoice' },
  { value: 'quote',        label: 'Quote' },
  { value: 'other',        label: 'Other' },
];

export default function UploadModal({ open, onClose, userId }: Props) {
  const router     = useRouter();
  const fileRef    = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  const [step,         setStep]         = useState<Step>('choose');
  const [file,         setFile]         = useState<File | null>(null);
  const [fileError,    setFileError]    = useState('');

  // Metadata fields
  const [customerName, setCustomerName] = useState('');
  const [docType,      setDocType]      = useState<DocumentType>('deed_of_sale');
  const [carMake,      setCarMake]      = useState('');
  const [carModel,     setCarModel]     = useState('');
  const [carYear,      setCarYear]      = useState('');
  const [carPrice,     setCarPrice]     = useState('');
  const [notes,        setNotes]        = useState('');

  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  function reset() {
    setStep('choose');
    setFile(null);
    setFileError('');
    setCustomerName(''); setDocType('deed_of_sale');
    setCarMake(''); setCarModel(''); setCarYear(''); setCarPrice(''); setNotes('');
    setErrors({});
    setSaving(false);
    setSaveError('');
  }

  function handleClose() { reset(); onClose(); }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setFileError('Please select a PDF file');
      return;
    }
    setFileError('');
    setFile(selected);
    setStep('metadata');
  }

  async function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const image = e.target.files?.[0];
    if (!image) return;
    setFileError('');

    try {
      // Convert image to PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const imgDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      // Create PDF sized to the image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload  = () => resolve(el);
        el.onerror = reject;
        el.src = imgDataUrl;
      });

      const isLandscape = img.width > img.height;
      const doc = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'px', format: [img.width, img.height] });
      doc.addImage(imgDataUrl, 'JPEG', 0, 0, img.width, img.height);
      const pdfBlob = doc.output('blob');

      const pdfFile = new File([pdfBlob], image.name.replace(/\.[^.]+$/, '') + '.pdf', { type: 'application/pdf' });
      setFile(pdfFile);
      setDocType('car_title');
      setStep('metadata');
    } catch (err) {
      console.error(err);
      setFileError('Failed to process image. Please try again.');
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = 'Customer name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !file) return;
    setSaving(true);
    setSaveError('');

    try {
      const supabase = createClient();
      const docId    = crypto.randomUUID();
      const filePath = `documents/${userId}/${docId}.pdf`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { contentType: 'application/pdf' });

      if (uploadErr) throw uploadErr;

      // Insert document record
      const { error: dbErr } = await supabase.from('documents').insert({
        id:            docId,
        user_id:       userId,
        customer_name: customerName.trim(),
        document_type: docType,
        file_path:     filePath,
        file_name:     file.name,
        car_make:      carMake.trim()  || null,
        car_model:     carModel.trim() || null,
        car_year:      carYear  ? parseInt(carYear)   : null,
        car_price:     carPrice ? parseFloat(carPrice) : null,
        notes:         notes.trim() || null,
        qr_code_data:  `${docId}`,
      });

      if (dbErr) throw dbErr;

      router.refresh();
      handleClose();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Upload failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={step === 'choose' ? 'Add Document' : 'Document Details'}>
      {step === 'choose' && (
        <div className="flex flex-col gap-3">
          {/* Upload PDF */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 min-h-[64px] text-left hover:bg-gray-100 active:bg-gray-200 transition-colors w-full"
          >
            <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center shrink-0">
              <Upload size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-navy text-base">Upload PDF from device</p>
              <p className="text-muted text-sm">Select a PDF file from your phone or computer</p>
            </div>
          </button>

          {fileError && <p className="text-danger text-sm font-medium">{fileError}</p>}

          {/* Camera capture */}
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 min-h-[64px] text-left hover:bg-gray-100 active:bg-gray-200 transition-colors w-full"
          >
            <div className="w-11 h-11 rounded-xl bg-amber flex items-center justify-center shrink-0">
              <Camera size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-navy text-base">Capture with camera</p>
              <p className="text-muted text-sm">Photograph a car title or document</p>
            </div>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileSelect}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleCameraCapture}
          />
        </div>
      )}

      {step === 'metadata' && file && (
        <div className="flex flex-col gap-4">
          {/* File name display */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <FileText size={20} className="text-navy shrink-0" />
            <p className="text-navy text-sm font-medium truncate">{file.name}</p>
          </div>

          <Input
            label="Customer Name"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            error={errors.customerName}
            placeholder="Full name"
          />

          {/* Document type select */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-navy uppercase tracking-wide">
              Document Type
            </label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as DocumentType)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-amber"
            >
              {DOC_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Car Make"  value={carMake}  onChange={e => setCarMake(e.target.value)}  placeholder="e.g. Toyota" />
            <Input label="Car Model" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="e.g. Hilux" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Year"         type="number" value={carYear}  onChange={e => setCarYear(e.target.value)}  placeholder="e.g. 2022" />
            <Input label="Car Price ($)" type="number" value={carPrice} onChange={e => setCarPrice(e.target.value)} placeholder="0.00" />
          </div>

          <Textarea
            label="Notes (Optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes..."
          />

          {saveError && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
              <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
              <p className="text-danger text-sm font-medium">{saveError}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button variant="primary" size="lg" fullWidth loading={saving} onClick={handleSave}>
              Save Document
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={() => setStep('choose')} disabled={saving}>
              Back
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
