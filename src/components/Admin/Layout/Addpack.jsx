// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Check, ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
// import { useState } from "react";
// import { fetch_products } from '../../../api/products';

// // AddPack Component (POS-style design)
// export const AddPack = ({ editingPack, onCancel, onSuccess }) => {
//   const queryClient = useQueryClient();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const productsPerPage = 12;
//   const [formData, setFormData] = useState({
//     name: editingPack?.name || '',
//     description: editingPack?.description || '',
//     price: editingPack?.price || '',
//     product_ids: editingPack?.products ? editingPack.products.map(p => p.id) : []
//   });

//   // Fetch all products
//   const { data: productsData, isLoading: productsLoading } = useQuery({
//     queryKey: ['products'],
//     queryFn: fetch_products,
//   });

//   // Filter products based on search term
//   const filteredProducts = productsData?.filter(product => 
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   // Calculate pagination
//   const totalProducts = filteredProducts.length;
//   const totalPages = Math.ceil(totalProducts / productsPerPage);
//   const startIndex = (currentPage - 1) * productsPerPage;
//   const endIndex = startIndex + productsPerPage;
//   const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
//   const hasNext = endIndex < totalProducts;
//   const hasPrev = currentPage > 1;

//   const createMutation = useMutation({
//     mutationFn: create_pack,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['packs']);
//       onSuccess();
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: update_pack,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['packs']);
//       onSuccess();
//     },
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const toggleProductSelection = (productId) => {
//     setFormData(prev => {
//       const productIds = [...prev.product_ids];
//       const index = productIds.indexOf(productId);
      
//       if (index > -1) {
//         productIds.splice(index, 1);
//       } else {
//         productIds.push(productId);
//       }
      
//       return { ...prev, product_ids: productIds };
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (!formData.name || !formData.price) {
//       alert('Please fill in all required fields');
//       return;
//     }
    
//     if (editingPack) {
//       updateMutation.mutate({ ...formData, id: editingPack.id });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//   };

//   return (
//     <div className="p-6 ml-72">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
//         {/* Product Search & List */}
//         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
//           {/* Header */}
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-900">
//                 {editingPack ? 'Edit Pack' : 'Create New Pack'}
//               </h2>
//               <div className="text-sm text-gray-500">
//                 Page {currentPage} of {totalPages}
//               </div>
//             </div>

//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Products Grid */}
//           <div className="flex-1 p-6 overflow-y-auto">
//             {productsLoading ? (
//               <div className="flex justify-center items-center h-40">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
//                   {paginatedProducts.map((product) => (
//                     <div
//                       key={product.id}
//                       className={`relative rounded-lg p-4 cursor-pointer transition-colors ${
//                         formData.product_ids.includes(product.id)
//                           ? 'bg-blue-50 border-2 border-blue-200'
//                           : 'bg-gray-50 hover:bg-gray-100'
//                       }`}
//                       onClick={() => toggleProductSelection(product.id)}
//                     >
//                       <img
//                         src={`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`}
//                         alt={product.name}
//                         className="w-full h-20 object-cover rounded-lg mb-2"
//                         onError={(e) => {
//                           e.target.src = '/placeholder-product.png';
//                         }}
//                       />
//                       <h3 className="font-medium text-gray-900 text-sm truncate">
//                         {product.name}
//                       </h3>
//                       <p className="text-green-600 font-bold text-sm">
//                         ${product.price}
//                       </p>
//                       <p className="text-xs text-gray-500">Stock: {product.stock}</p>
//                       {formData.product_ids.includes(product.id) && (
//                         <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
//                           <Check className="h-3 w-3 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Products Pagination */}
//                 {totalProducts > productsPerPage && (
//                   <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
//                     <div className="text-sm text-gray-700">
//                       Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
//                       <span className="font-medium">{Math.min(endIndex, totalProducts)}</span> of{' '}
//                       <span className="font-medium">{totalProducts}</span> products
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={!hasPrev}
//                         className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium ${
//                           hasPrev
//                             ? 'text-gray-700 bg-white hover:bg-gray-50'
//                             : 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                         }`}
//                       >
//                         <ChevronLeft className="h-4 w-4 mr-1" />
//                         Previous
//                       </button>
//                       <div className="flex items-center space-x-1">
//                         {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                           let pageNum;
//                           if (totalPages <= 5) {
//                             pageNum = i + 1;
//                           } else if (currentPage <= 3) {
//                             pageNum = i + 1;
//                           } else if (currentPage >= totalPages - 2) {
//                             pageNum = totalPages - 4 + i;
//                           } else {
//                             pageNum = currentPage - 2 + i;
//                           }

//                           return (
//                             <button
//                               key={pageNum}
//                               onClick={() => handlePageChange(pageNum)}
//                               className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
//                                 currentPage === pageNum
//                                   ? 'bg-green-500 text-white'
//                                   : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
//                               }`}
//                             >
//                               {pageNum}
//                             </button>
//                           );
//                         })}
//                         {totalPages > 5 && (
//                           <span className="px-2 py-1.5 text-gray-500">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </span>
//                         )}
//                       </div>
//                       <button
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={!hasNext}
//                         className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium ${
//                           hasNext
//                             ? 'text-gray-700 bg-white hover:bg-gray-50'
//                             : 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                         }`}
//                       >
//                         Next
//                         <ChevronRight className="h-4 w-4 ml-1" />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* Pack Details Form */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
//           {/* Form Header */}
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center space-x-3">
//               <Package className="h-6 w-6 text-green-600" />
//               <h2 className="text-xl font-bold text-gray-900">Pack Details</h2>
//               <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
//                 {formData.product_ids.length}
//               </span>
//             </div>
//           </div>

//           {/* Form Content */}
//           <div className="flex-1 p-6 overflow-y-auto">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Pack Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Price *
//                 </label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleInputChange}
//                   step="0.01"
//                   min="0"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Selected Products ({formData.product_ids.length})
//                 </label>
//                 <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
//                   {formData.product_ids.length === 0 ? (
//                     <p className="text-gray-500 text-sm">No products selected</p>
//                   ) : (
//                     formData.product_ids.map(id => {
//                       const product = productsData?.find(p => p.id === id);
//                       return product ? (
//                         <div key={id} className="flex items-center justify-between py-1">
//                           <span className="text-sm text-gray-900">{product.name}</span>
//                           <button
//                             type="button"
//                             onClick={() => toggleProductSelection(id)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             <X className="h-4 w-4" />
//                           </button>
//                         </div>
//                       ) : null;
//                     })
//                   )}
//                 </div>
//               </div>
//             </form>
//           </div>

//           {/* Form Actions */}
//           <div className="p-6 border-t border-gray-200 bg-gray-50 mt-auto">
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={onCancel}
//                 disabled={createMutation.isLoading || updateMutation.isLoading}
//                 className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={createMutation.isLoading || updateMutation.isLoading}
//                 className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
//               >
//                 {createMutation.isLoading || updateMutation.isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     {editingPack ? 'Updating...' : 'Creating...'}
//                   </div>
//                 ) : (
//                   editingPack ? 'Update Pack' : 'Create Pack'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };