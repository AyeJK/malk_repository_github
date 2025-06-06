import React from 'react';

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  post: {
    id: string;
    fields: {
      UserCaption: string;
    };
  };
}

export default function DeletePostModal({ isOpen, onClose, onConfirm, post }: DeletePostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Delete Post</h2>
        <p className="text-gray-300 mb-4">Are you sure you want to <span className="text-red-400 font-semibold">delete</span> this post? This action cannot be undone.</p>
        <div className="bg-gray-800 rounded p-3 mb-4 text-gray-200">
          {post.fields.UserCaption}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 