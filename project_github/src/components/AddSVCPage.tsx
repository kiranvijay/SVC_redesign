import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import AddSVCFormAccordion from './AddSVCFormAccordion';
import AddSVCForm from './AddSVCForm';

export default function AddSVCPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnPath = searchParams.get('return') || '/';
  const viewType = searchParams.get('view') || 'accordion'; // 'accordion' or 'stepper'

  const handleClose = () => {
    navigate(returnPath);
  };

  const handleSuccess = () => {
    navigate(returnPath);
  };

  const toggleView = () => {
    const newView = viewType === 'accordion' ? 'stepper' : 'accordion';
    setSearchParams({ return: returnPath, view: newView });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <ArrowLeft
              onClick={handleClose}
              style={{ cursor: 'pointer' }}
              className="h-4 w-4"
            />
              <div>
                <h1 className="text-base font-bold text-primary-text text-gray-900 dark:text-white">Add New Service</h1>
                <p className="text-xs text-gray-600">Create a new SVC configuration</p>
              </div>
            </div>
            <button
              onClick={toggleView}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {viewType === 'accordion' ? (
                <>
                  <List className="w-4 h-4" />
                  Switch to Stepper View
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  Switch to Accordion View
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4">
        {viewType === 'accordion' ? (
          <AddSVCFormAccordion
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        ) : (
          <AddSVCForm
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
