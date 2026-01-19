// Cover Letter Template Styles - Matching Resume Templates
export const coverLetterStyles = {
  modern: {
    container: "bg-white shadow-lg rounded-lg p-10 max-w-3xl mx-auto",
    header: "border-b border-gray-200 pb-6 mb-6",
    senderName: "text-2xl font-bold text-gray-800 tracking-tight",
    senderInfo: "text-sm text-gray-500 mt-1",
    date: "text-sm text-gray-500 mt-4",
    recipientSection: "mb-6",
    recipientName: "text-base font-semibold text-gray-800",
    recipientInfo: "text-sm text-gray-600",
    greeting: "text-base text-gray-800 mb-4 font-medium",
    bodyParagraph: "text-gray-600 text-sm leading-relaxed mb-4 text-justify",
    closing: "text-base text-gray-800 mt-6",
    signature: "text-base font-bold text-blue-700 mt-2",
  },

  classic: {
    container:
      "bg-gray-50 rounded-lg border border-gray-300 p-10 max-w-3xl mx-auto",
    header: "border-b border-gray-400 pb-6 mb-6",
    senderName:
      "text-2xl font-bold font-serif text-black uppercase tracking-wide",
    senderInfo: "text-sm text-gray-600 font-serif mt-1",
    date: "text-sm text-gray-600 font-serif italic mt-4",
    recipientSection: "mb-6",
    recipientName: "text-base font-bold font-serif text-black",
    recipientInfo: "text-sm text-gray-600 font-serif",
    greeting: "text-base font-serif text-black mb-4",
    bodyParagraph:
      "text-gray-700 font-serif text-sm leading-relaxed mb-4 text-justify",
    closing: "text-base font-serif text-black mt-6",
    signature: "text-base font-bold font-serif text-black mt-2",
  },

  minimal: {
    container:
      "bg-white p-10 rounded-lg border-t-4 border-blue-500 max-w-3xl mx-auto shadow-xs",
    header: "mb-8",
    senderName: "text-2xl font-bold text-gray-900",
    senderInfo: "text-sm text-gray-400 mt-1",
    date: "text-sm text-gray-400 mt-4",
    recipientSection: "mb-6",
    recipientName: "text-base font-semibold text-gray-900",
    recipientInfo: "text-sm text-gray-500",
    greeting: "text-base text-gray-800 mb-4",
    bodyParagraph: "text-gray-500 text-sm leading-relaxed mb-4",
    closing: "text-base text-gray-800 mt-6",
    signature: "text-base font-bold text-gray-900 mt-2",
  },

  creative: {
    container:
      "bg-linear-to-br from-purple-50 to-blue-50 p-10 rounded-lg max-w-3xl mx-auto shadow-md",
    header: "pb-6 mb-6",
    senderName:
      "text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent",
    senderInfo: "text-sm text-gray-500 mt-1",
    date: "text-sm text-purple-500 mt-4",
    recipientSection: "mb-6 bg-white bg-opacity-50 p-4 rounded-lg",
    recipientName: "text-base font-semibold text-purple-700",
    recipientInfo: "text-sm text-gray-600",
    greeting: "text-base text-purple-700 mb-4 font-medium",
    bodyParagraph: "text-gray-600 text-sm leading-relaxed mb-4",
    closing: "text-base text-purple-700 mt-6",
    signature:
      "text-base font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mt-2",
  },

  professional: {
    container:
      "bg-white p-10 border-l-8 rounded-lg border-gray-700 max-w-3xl mx-auto shadow-md",
    header: "border-b-2 border-gray-700 pb-6 mb-6",
    senderName: "text-2xl font-bold text-gray-800",
    senderInfo: "text-sm text-gray-600 mt-1",
    date: "text-sm text-gray-600 mt-4 uppercase tracking-wider",
    recipientSection: "mb-6 border-l-2 border-gray-400 pl-4",
    recipientName: "text-base font-bold text-gray-800",
    recipientInfo: "text-sm text-gray-600",
    greeting: "text-base text-gray-800 mb-4 font-medium",
    bodyParagraph: "text-gray-700 text-sm leading-relaxed mb-4 text-justify",
    closing: "text-base text-gray-800 mt-6",
    signature: "text-base font-bold text-gray-800 mt-2",
  },

  elegant: {
    container:
      "bg-linear-to-br from-slate-50 to-gray-100 rounded-lg p-10 max-w-3xl mx-auto shadow-lg border border-gray-200",
    header: "border-b-2 border-indigo-200 pb-6 mb-6",
    senderName: "text-3xl font-light text-gray-800 tracking-wide",
    senderInfo: "text-sm text-indigo-600 font-light mt-1",
    date: "text-sm text-gray-500 font-light italic mt-4",
    recipientSection: "mb-6",
    recipientName: "text-lg font-medium text-indigo-700",
    recipientInfo: "text-sm text-gray-500 font-light",
    greeting: "text-base text-gray-800 mb-4 font-light italic",
    bodyParagraph: "text-gray-600 text-sm leading-relaxed mb-4",
    closing: "text-base text-gray-800 mt-6 font-light",
    signature: "text-lg font-medium text-indigo-700 mt-2",
  },

  executive: {
    container:
      "bg-white p-10 max-w-3xl mx-auto rounded-lg shadow-xl border-t-4 border-gray-800",
    header: "bg-gray-800 text-white p-4 -mx-10 -mt-10 mb-8",
    senderName: "text-2xl font-bold tracking-tight",
    senderInfo: "text-sm opacity-90 mt-1",
    date: "text-sm text-gray-600 mt-4 uppercase tracking-wider",
    recipientSection: "mb-6 bg-gray-100 p-4 -mx-10 px-10",
    recipientName: "text-base font-bold text-gray-800",
    recipientInfo: "text-sm text-gray-600",
    greeting: "text-base text-gray-800 mb-4 font-semibold",
    bodyParagraph: "text-gray-700 text-sm leading-relaxed mb-4",
    closing: "text-base text-gray-800 mt-6 font-medium",
    signature: "text-base font-bold text-gray-800 mt-2",
  },

  techie: {
    container:
      "bg-gray-900 text-green-400 p-10 rounded-lg max-w-3xl mx-auto shadow-lg border border-green-500 font-mono",
    header: "border-b border-green-500 pb-6 mb-6",
    senderName: "text-2xl font-bold text-green-300",
    senderInfo: "text-sm text-green-500 mt-1",
    date: "text-sm text-green-500 mt-4",
    recipientSection: "mb-6 border-l-2 border-green-500 pl-4",
    recipientName: "text-base font-bold text-green-300",
    recipientInfo: "text-sm text-green-500",
    greeting: "text-base text-green-400 mb-4",
    bodyParagraph: "text-green-400 text-sm leading-relaxed mb-4",
    closing: "text-base text-green-400 mt-6",
    signature: "text-base font-bold text-green-300 mt-2",
  },

  artistic: {
    container:
      "bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-lg p-10 max-w-3xl mx-auto shadow-lg border-2 border-purple-200",
    header: "pb-6 mb-6",
    senderName:
      "text-3xl font-bold bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent",
    senderInfo: "text-sm text-purple-600 mt-1",
    date: "text-sm text-purple-500 italic mt-4",
    recipientSection:
      "mb-6 bg-linear-to-r from-pink-100 to-purple-100 p-4 rounded-lg border border-purple-200",
    recipientName:
      "text-lg font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",
    recipientInfo: "text-sm text-purple-600",
    greeting: "text-base text-purple-700 mb-4 font-medium",
    bodyParagraph: "text-gray-700 text-sm leading-relaxed mb-4",
    closing: "text-base text-purple-700 mt-6",
    signature:
      "text-lg font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mt-2",
  },

  corporate: {
    container:
      "bg-white p-10 max-w-3xl mx-auto rounded-lg shadow-md border-2 border-blue-900",
    header: "border-b-4 border-blue-900 pb-6 mb-6",
    senderName: "text-2xl font-bold text-blue-900 uppercase tracking-wide",
    senderInfo: "text-sm text-blue-700 mt-1",
    date: "text-sm text-blue-700 uppercase tracking-wide mt-4",
    recipientSection:
      "mb-6 bg-blue-100 p-4 -mx-10 px-10 border-l-4 border-blue-900",
    recipientName: "text-base font-bold text-blue-900",
    recipientInfo: "text-sm text-blue-700",
    greeting: "text-base text-blue-900 mb-4 font-semibold",
    bodyParagraph: "text-gray-700 text-sm leading-relaxed mb-4 text-justify",
    closing: "text-base text-blue-900 mt-6 font-medium",
    signature: "text-base font-bold text-blue-900 uppercase mt-2",
  },
};
