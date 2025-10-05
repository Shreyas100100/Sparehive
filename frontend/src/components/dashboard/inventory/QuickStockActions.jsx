import { useState } from "react";
import { stockAPI } from "../../../services/api";

export default function QuickStockActions({ material, onStockUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleQuickAction = async (action, quantity = 1) => {
    try {
      setLoading(true);
      const response = await stockAPI.updateStock(material._id, quantity, action);
      onStockUpdate(material._id, response.data.currentStock);
    } catch (err) {
      console.error("Quick stock action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleQuickAction('remove', 1)}
        disabled={loading || material.currentStock <= 0}
        className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Remove 1 item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
        {material.currentStock}
      </span>
      
      <button
        onClick={() => handleQuickAction('add', 1)}
        disabled={loading}
        className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Add 1 item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}