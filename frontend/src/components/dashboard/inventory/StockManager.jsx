import { useState } from "react";
import API, { stockAPI } from "../../../services/api";

export default function StockManager({ material, onStockUpdate, onClose }) {
  const [addQuantity, setAddQuantity] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [setQuantity, setSetQuantity] = useState("");
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStockOperation = async (action, quantity) => {
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await stockAPI.updateStock(material._id, parseInt(quantity), action);

      onStockUpdate(material._id, response.data.currentStock);
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    handleStockOperation("add", addQuantity);
  };

  const handleRemoveStock = (e) => {
    e.preventDefault();
    handleStockOperation("remove", removeQuantity);
  };

  const handleSetStock = (e) => {
    e.preventDefault();
    handleStockOperation("set", setQuantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Stock Management</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Material Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 text-lg mb-2">{material.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Current Stock:</span>
              <span className="ml-2 font-semibold text-blue-600">{material.currentStock} {material.unit}</span>
            </div>
            <div>
              <span className="text-gray-600">Minimum Stock:</span>
              <span className="ml-2 font-semibold text-gray-700">{material.minimumStock} {material.unit}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 font-medium text-gray-700">{material.location}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                material.currentStock <= material.minimumStock 
                  ? "bg-red-100 text-red-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {material.currentStock <= material.minimumStock ? "Low Stock" : "In Stock"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "add" 
                ? "border-green-500 text-green-600 bg-green-50" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Stock
          </button>
          <button
            onClick={() => setActiveTab("remove")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "remove" 
                ? "border-red-500 text-red-600 bg-red-50" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Remove Stock
          </button>
          <button
            onClick={() => setActiveTab("set")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "set" 
                ? "border-blue-500 text-blue-600 bg-blue-50" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Set Stock
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Add Stock Tab */}
          {activeTab === "add" && (
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-2">Add Stock</h5>
                <p className="text-sm text-green-700 mb-4">Increase the current stock quantity when new items arrive.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Add ({material.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter quantity to add"
                    required
                  />
                </div>

                {addQuantity && (
                  <div className="mt-3 p-3 bg-white border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>New stock will be:</strong> {material.currentStock + parseInt(addQuantity || 0)} {material.unit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !addQuantity}
                  className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Adding..." : `Add ${addQuantity || 0} ${material.unit}`}
                </button>
              </div>
            </form>
          )}

          {/* Remove Stock Tab */}
          {activeTab === "remove" && (
            <form onSubmit={handleRemoveStock} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2">Remove Stock</h5>
                <p className="text-sm text-red-700 mb-4">Decrease the current stock quantity when items are used or sold.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Remove ({material.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={material.currentStock}
                    value={removeQuantity}
                    onChange={(e) => setRemoveQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter quantity to remove"
                    required
                  />
                </div>

                {removeQuantity && (
                  <div className="mt-3 p-3 bg-white border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>New stock will be:</strong> {Math.max(0, material.currentStock - parseInt(removeQuantity || 0))} {material.unit}
                    </p>
                    {parseInt(removeQuantity || 0) > material.currentStock && (
                      <p className="text-sm text-red-600 mt-1">
                        ⚠️ Cannot remove more than available stock ({material.currentStock} {material.unit})
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !removeQuantity || parseInt(removeQuantity || 0) > material.currentStock}
                  className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Removing..." : `Remove ${removeQuantity || 0} ${material.unit}`}
                </button>
              </div>
            </form>
          )}

          {/* Set Stock Tab */}
          {activeTab === "set" && (
            <form onSubmit={handleSetStock} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">Set Exact Stock</h5>
                <p className="text-sm text-blue-700 mb-4">Set the exact stock quantity after physical inventory count.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Stock Quantity ({material.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={setQuantity}
                    onChange={(e) => setSetQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter exact stock quantity"
                    required
                  />
                </div>

                {setQuantity !== "" && (
                  <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Current:</strong> {material.currentStock} {material.unit} → <strong>New:</strong> {setQuantity || 0} {material.unit}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {parseInt(setQuantity || 0) > material.currentStock ? "Increase" : parseInt(setQuantity || 0) < material.currentStock ? "Decrease" : "No change"}: {Math.abs(parseInt(setQuantity || 0) - material.currentStock)} {material.unit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || setQuantity === ""}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Setting..." : `Set to ${setQuantity || 0} ${material.unit}`}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">Quick Actions:</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("add");
                setAddQuantity("1");
              }}
              className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              +1
            </button>
            <button
              onClick={() => {
                setActiveTab("add");
                setAddQuantity("5");
              }}
              className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              +5
            </button>
            <button
              onClick={() => {
                setActiveTab("remove");
                setRemoveQuantity("1");
              }}
              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              disabled={material.currentStock < 1}
            >
              -1
            </button>
            <button
              onClick={() => {
                setActiveTab("remove");
                setRemoveQuantity("5");
              }}
              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              disabled={material.currentStock < 5}
            >
              -5
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}