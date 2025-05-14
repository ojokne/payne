import { X, ExternalLink, Share2 } from "lucide-react";
import QRCode from "react-qr-code";
import { Invoice } from "@/types/types";

interface QRCodeModalProps {
  onClose: () => void;
  invoice: Invoice;
  onCopyLink: () => void;
  onShare: () => void;
}

export default function QRCodeModal({
  onClose,
  invoice,
  onCopyLink,
  onShare,
}: QRCodeModalProps) {

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment for Invoice {invoice.invoiceNumber}
        </h3>

        <div className="flex flex-col items-center mb-6">
          <div className="bg-white p-4 rounded-lg border mb-4">
            <QRCode value={invoice.paymentLink} size={200} />
          </div>

          <p className="text-sm text-gray-500 mb-2">
            Amount:{" "}
            <span className="font-medium">${invoice.amount.toFixed(2)}</span>
          </p>

          <p className="text-sm text-gray-500 mb-4 break-all">
            Payment Link:{" "}
            <a
              href={invoice.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
            >
              {invoice.paymentLink}
            </a>
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCopyLink}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Copy Link
          </button>

          <button
            onClick={onShare}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
