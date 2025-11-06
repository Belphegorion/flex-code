import { useState } from 'react';
import { FiCalendar, FiClock, FiQrCode, FiX, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function GroupScheduler({ groupId, onClose, onScheduled }) {
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [workersNotified, setWorkersNotified] = useState(0);

  const handleSchedule = async (e) => {
    e.preventDefault();
    
    if (!sessionDate || !sessionTime) {
      toast.error('Please select date and time');
      return;
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${sessionDate}T${sessionTime}`);
    if (selectedDateTime < new Date()) {
      toast.error('Session date and time cannot be in the past');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/groups/${groupId}/schedule`, {
        sessionDate,
        sessionTime
      });

      setQrCode(response.qrCode);
      setWorkersNotified(response.workersNotified);
      toast.success(response.message);
      onScheduled();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    } finally {
      setLoading(false);
    }
  };

  const copyQRCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success('QR code copied to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Schedule Group Session</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        {!qrCode ? (
          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiCalendar /> Session Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiClock /> Session Time
              </label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                A QR code will be generated and sent to all workers for this event. 
                Workers can scan this code to join the group chat.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FiQrCode />
                {loading ? 'Scheduling...' : 'Generate QR'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Session Scheduled Successfully!
              </p>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                {workersNotified} workers have been notified
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={qrCode} 
                alt="Group QR Code" 
                className="mx-auto mb-4"
                style={{ maxWidth: '200px' }}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share this QR code with workers
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyQRCode}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <FiCopy />
                Copy QR
              </button>
              <button
                onClick={onClose}
                className="btn-primary flex-1"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}