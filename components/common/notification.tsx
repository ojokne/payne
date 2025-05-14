import { AlertCircle, Check, X } from "lucide-react";

export default function Notification ({
    type,
    message,
    onClose,
  }: {
    type: string;
    message: string;
    onClose: () => void;
  })  {
    return (
      <div
        className={`p-4 rounded-lg flex items-center gap-3 ${
          type === "success"
            ? "bg-green-50 border-l-4 border-green-500 text-green-700"
            : "bg-red-50 border-l-4 border-red-500 text-red-700"
        }`}
      >
        {type === "success" ? (
          <Check size={20} className="text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
        )}
        <p>{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    );
  };
