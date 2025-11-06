import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload, FiShare2, FiClock, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const WorkQR = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRData();
  }, [eventId]);

  const fetchQRData = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/qr`);
      setQrData(res);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load QR code');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `work-qr-${qrData.event?.title || 'event'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const shareQR = async () => {
    if (!qrData?.qrCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Work QR - ${qrData.event?.title}`,
          text: 'Scan this QR code to track work hours',
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            QR Code Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The QR code for this event is not available.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(qrData.expiryTime);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Work Hours QR
          </h1>
        </div>

        {/* Event Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
            {qrData.event?.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <FiCalendar size={16} />
              <span>
                {new Date(qrData.event?.dateStart).toLocaleDateString()} - 
                {new Date(qrData.event?.dateEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm text-center">
          {isExpired ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">
                <FiClock size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">QR Code Expired</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This QR code has expired. Please contact your organizer for a new one.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img 
                  src={qrData.qrCode} 
                  alt="Work Hours QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Scan to Track Work Hours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use this QR code to check in and check out for your work sessions
              </p>
              
              {/* Expiry Info */}
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <FiClock size={14} />
                <span>
                  Expires: {new Date(qrData.expiryTime).toLocaleDateString()} at{' '}
                  {new Date(qrData.expiryTime).toLocaleTimeString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isExpired && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiDownload size={18} />
              <span>Download</span>
            </button>
            <button
              onClick={shareQR}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiShare2 size={18} />
              <span>Share</span>
            </button>
          </div>
        )}

        {/* Jobs List */}
        {qrData.jobs && qrData.jobs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Your Jobs for this Event
            </h3>
            <div className="space-y-2">
              {qrData.jobs.map(job => (
                <div 
                  key={job._id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkQR;