'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Users,
  QrCode,
  Download,
  Printer
} from 'lucide-react';
import { formatDate } from '@/app/lib/utils';
import { useAuth } from '@/app/contexts/AuthContext';
import QRCode from 'react-qr-code';

interface OrderItem {
  donationId: string;
  quantity: number;
  donorName: string;
  foodType: string;
  qrCode: string;
}

interface NGOOrder {
  id: string;
  ngoId: string;
  ngoName: string;
  items: OrderItem[];
  status: 'ordered' | 'picked' | 'delivered';
  createdAt: Date;
  deliveryAddress: string;
  totalItems: number;
}

export default function NGOOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<NGOOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<NGOOrder | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setIsLoading(true);
    
    try {
      const savedOrders = JSON.parse(localStorage.getItem('ngoOrders') || '[]');
      // Filter orders for current NGO
      const ngoOrders = savedOrders.filter((order: NGOOrder) => order.ngoId === user?.id);
      
      // Convert date strings back to Date objects
      const ordersWithDates = ngoOrders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt)
      }));
      
      setOrders(ordersWithDates);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return { color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'picked': return { color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'delivered': return { color: 'text-green-600', bg: 'bg-green-50' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ordered': return 'Order Placed';
      case 'picked': return 'Being Delivered';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const handlePrintQR = (order: NGOOrder) => {
    setSelectedOrder(order);
    setShowQRModal(true);
  };

  const downloadQRCode = (qrData: string, fileName: string) => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector(`[data-qr="${qrData}"]`) as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track your food orders and delivery status</p>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-purple-600" />
              <span className="text-sm text-gray-600">Order Management</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-900">Total Orders</h3>
                <p className="text-2xl font-bold text-purple-700">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="font-medium text-gray-900">Pending</h3>
                <p className="text-2xl font-bold text-yellow-700">
                  {orders.filter(o => o.status === 'ordered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">In Transit</h3>
                <p className="text-2xl font-bold text-blue-700">
                  {orders.filter(o => o.status === 'picked').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900">Delivered</h3>
                <p className="text-2xl font-bold text-green-700">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading orders...</span>
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600">You haven't placed any food orders yet</p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Get started:</strong> Go to Food Availability page to browse and order food donations!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const statusInfo = getStatusColor(order.status);
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Ordered: {formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{order.totalItems} items</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>NGO: {order.ngoName}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Order Items:</h4>
                          {order.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-900">{item.foodType}</span>
                                <span className="text-sm text-gray-600">x{item.quantity}</span>
                                <span className="text-sm text-gray-500">from {item.donorName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">QR: {item.qrCode}</span>
                                <button
                                  onClick={() => downloadQRCode(item.qrCode, `QR-${item.qrCode}`)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Download QR Code"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => handlePrintQR(order)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>View QR Codes</span>
                        </button>
                        
                        <button
                          onClick={loadOrders}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <Loader2 className="w-4 h-4" />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Codes for Order #{selectedOrder.id}</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Volunteers will scan these QR codes to verify delivery. Print or download these codes for your records.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <h4 className="font-medium text-gray-900">{item.foodType}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">From: {item.donorName}</p>
                      </div>
                      
                      <div className="flex justify-center mb-3">
                        <QRCode
                          value={item.qrCode}
                          size={120}
                          data-qr={item.qrCode}
                          className="border border-gray-200 p-2 rounded"
                        />
                      </div>
                      
                      <div className="text-center space-y-2">
                        <p className="text-xs text-gray-500 font-mono">{item.qrCode}</p>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => downloadQRCode(item.qrCode, `QR-${item.qrCode}`)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Delivery Instructions:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Volunteers will scan these QR codes when delivering food</li>
                    <li>• Each QR code corresponds to a specific food item</li>
                    <li>• Keep these codes ready for volunteer verification</li>
                    <li>• Status will update to "delivered" after QR code scan</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 