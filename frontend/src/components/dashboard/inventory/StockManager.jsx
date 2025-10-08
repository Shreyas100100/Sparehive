import { useState } from "react";
import API, { stockAPI } from "../../../services/api";

export default function StockManager({ material, onStockUpdate, onClose }) {
  const [addQuantity, setAddQuantity] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [setQuantity, setSetQuantity] = useState("");
  const [addReason, setAddReason] = useState("");
  const [removeReason, setRemoveReason] = useState("");
  const [setReason, setSetReason] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [removeNotes, setRemoveNotes] = useState("");
  const [setNotes, setSetNotes] = useState("");
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const handleStockOperation = async (action, quantity, reason, notes) => {
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await stockAPI.updateStock(material._id, parseInt(quantity), action, reason, notes);

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
    handleStockOperation("add", addQuantity, addReason, addNotes);
  };

  const handleRemoveStock = (e) => {
    e.preventDefault();
    handleStockOperation("remove", removeQuantity, removeReason, removeNotes);
  };

  const handleSetStock = (e) => {
    e.preventDefault();
    handleStockOperation("set", setQuantity, setReason, setNotes);
  };

  const loadTransactionHistory = async () => {
    if (historyLoaded) return;
    
    try {
      setLoadingHistory(true);
      const response = await stockAPI.getTransactionHistory(material._id, 20);
      setTransactions(response.data.transactions);
      setHistoryLoaded(true);
    } catch (err) {
      console.error("Failed to load transaction history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'add':
        return <span className="text-green-600">↗️</span>;
      case 'remove':
        return <span className="text-red-600">↘️</span>;
      case 'set':
        return <span className="text-blue-600">⚙️</span>;
      case 'initial':
        return <span className="text-gray-600">🏁</span>;
      default:
        return <span className="text-gray-600">📝</span>;
    }
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
              <span className="text-gray-600">Minimum Required:</span>
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
                  : material.currentStock <= material.minimumStock * 1.5
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
              }`}>
                {material.currentStock <= material.minimumStock 
                  ? "Low Stock" 
                  : material.currentStock <= material.minimumStock * 1.5
                    ? "Moderate Stock"
                    : "Good Stock"}
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
          <button
            onClick={() => {
              setActiveTab("history");
              loadTransactionHistory();
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history" 
                ? "border-purple-500 text-purple-600 bg-purple-50" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adding Stock
                  </label>
                  <input
                    type="text"
                    value={addReason}
                    onChange={(e) => setAddReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., New shipment received, Inventory correction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Any additional details about this stock addition"
                    rows="2"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Removing Stock
                  </label>
                  <input
                    type="text"
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., Sale, Usage, Damage, Loss"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={removeNotes}
                    onChange={(e) => setRemoveNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Any additional details about this stock removal"
                    rows="2"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Setting Stock
                  </label>
                  <input
                    type="text"
                    value={setReason}
                    onChange={(e) => setSetReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Physical inventory count, System correction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={setNotes}
                    onChange={(e) => setSetNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional details about this stock adjustment"
                    rows="2"
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
          
          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-medium text-purple-800 mb-2">Transaction History</h5>
                <p className="text-sm text-purple-700 mb-4">Complete audit trail of all stock movements for this material.</p>
                
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-purple-600 mt-2">Loading history...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
                    <p className="text-gray-600">No stock transactions have been recorded for this material.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map((transaction, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  transaction.type === 'add' ? 'bg-green-100 text-green-800' :
                                  transaction.type === 'remove' ? 'bg-red-100 text-red-800' :
                                  transaction.type === 'set' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {transaction.type.toUpperCase()}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {transaction.change} {transaction.unit}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                Stock: {transaction.previousStock} → {transaction.newStock} {transaction.unit}
                              </p>
                              {transaction.reason && (
                                <p className="text-sm text-gray-700 mb-1">
                                  <strong>Reason:</strong> {transaction.reason}
                                </p>
                              )}
                              {transaction.notes && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Notes:</strong> {transaction.notes}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                <span>By: {transaction.performedBy}</span>
                                <span>{formatDate(transaction.date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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