
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CRUDActionButtonsProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  viewLabel?: string;
  deleteLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  showEdit?: boolean;
  showView?: boolean;
  showDelete?: boolean;
}

const CRUDActionButtons: React.FC<CRUDActionButtonsProps> = ({
  onEdit,
  onView,
  onDelete,
  editLabel = 'Edit',
  viewLabel = 'View',
  deleteLabel = 'Delete',
  deleteConfirmTitle = 'Confirm Delete',
  deleteConfirmDescription = 'Are you sure you want to delete this item? This action cannot be undone.',
  showEdit = true,
  showView = false,
  showDelete = true,
}) => {
  return (
    <div className="flex gap-2">
      {showView && onView && (
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">{viewLabel}</span>
        </Button>
      )}
      
      {showEdit && onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">{editLabel}</span>
        </Button>
      )}
      
      {showDelete && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{deleteLabel}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default CRUDActionButtons;
