import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Upload, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { logAuditEvent } from '../../utils/audit';

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    address: '',
    voter_id: '',
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const idDocRef = useRef<HTMLInputElement>(null);
  const facePhotoRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      let idDocumentUrl = null;
      let facePhotoUrl = null;

      if (idDocument) {
        idDocumentUrl = await uploadFile(
          idDocument,
          'documents',
          `${user.id}/id-${Date.now()}.${idDocument.name.split('.').pop()}`
        );
      }

      if (facePhoto) {
        facePhotoUrl = await uploadFile(
          facePhoto,
          'photos',
          `${user.id}/face-${Date.now()}.${facePhoto.name.split('.').pop()}`
        );
      }

      const { error: insertError } = await supabase
        .from('voter_profiles')
        .insert({
          id: user.id,
          ...formData,
          id_document_url: idDocumentUrl,
          face_photo_url: facePhotoUrl,
        });

      if (insertError) throw insertError;

      await logAuditEvent('profile_created', { voter_id: formData.voter_id });

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-600 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Created Successfully!
          </h2>
          <p className="text-gray-600">
            Your profile is pending verification. You'll be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Provide your information to verify your voter identity
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="voter_id" className="block text-sm font-medium text-gray-700 mb-2">
                Voter ID Number *
              </label>
              <input
                id="voter_id"
                name="voter_id"
                type="text"
                value={formData.voter_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Residential Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Document
              </label>
              <input
                ref={idDocRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => idDocRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition flex items-center justify-center text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-5 h-5 mr-2" />
                {idDocument ? idDocument.name : 'Upload ID Document'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Face Photo
              </label>
              <input
                ref={facePhotoRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFacePhoto(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => facePhotoRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition flex items-center justify-center text-gray-600 hover:text-blue-600"
              >
                <Camera className="w-5 h-5 mr-2" />
                {facePhoto ? facePhoto.name : 'Upload Face Photo'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
