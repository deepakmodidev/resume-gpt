export const templateStyles = {
  modern: {
    container: "bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto",
    nameContainer: "text-center pb-1 mb-2",
    name: "text-3xl font-bold text-gray-800 tracking-tight",
    title: "text-base text-gray-500 font-medium",
    sectionHeader:
      "text-lg font-bold text-gray-700 mb-1 mt-3 flex items-center after:content-[''] after:grow after:h-px after:bg-gray-200 after:ml-2",
    skills: "flex flex-wrap gap-1",
    skillItem:
      "bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium shadow-xs",
    text: "text-gray-600 text-sm",
    projectTitle: "text-base font-bold text-blue-700",
    projectTech: "text-xs text-gray-500 font-medium",
    expTitle: "text-base font-bold text-blue-700",
    expDetails: "text-xs text-gray-500 font-medium",
    eduTitle: "text-base font-bold text-blue-700",
    contactList: "grid grid-cols-2 gap-1 text-gray-600 text-sm",
  },

  classic: {
    container:
      "bg-gray-50 rounded-lg border border-gray-300 p-8 max-w-4xl mx-auto",
    nameContainer: "text-center pb-1 mb-2 border-b border-gray-400",
    name: "text-3xl font-bold font-serif text-black uppercase tracking-wide",
    title: "text-base text-gray-600 font-medium font-serif italic",
    sectionHeader:
      "font-serif text-lg font-bold text-black mb-1 mt-3 uppercase border-b border-gray-400",
    skills: "text-gray-700 font-serif leading-tight text-sm",
    skillItem: "font-serif ",
    text: "text-gray-700 font-serif text-sm",
    projectTitle: "font-serif text-base font-bold text-black uppercase",
    projectTech: "text-xs font-serif italic text-gray-600",
    expTitle: "font-serif text-base font-bold text-black uppercase",
    expDetails: "font-serif text-xs italic text-gray-600",
    eduTitle: "font-serif text-base font-bold text-black uppercase",
    contactList: "text-gray-700 font-serif text-sm",
  },

  minimal: {
    container:
      "bg-white p-8 rounded-lg border-t-4 border-blue-500 max-w-4xl mx-auto shadow-xs",
    nameContainer: "mb-2",
    name: "text-3xl font-bold text-gray-900",
    title: "text-base text-gray-400 font-medium",
    sectionHeader:
      "text-lg font-bold text-gray-800 mb-1 mt-3 border-b border-gray-200",
    skills: "flex flex-wrap gap-1",
    skillItem: "bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded",
    text: "text-gray-500 text-sm leading-tight",
    projectTitle: "text-base font-bold text-gray-900",
    projectTech: "text-xs text-blue-500 font-medium uppercase tracking-wider",
    expTitle: "text-base font-bold text-gray-900",
    expDetails: "text-xs text-gray-400 uppercase tracking-wider",
    eduTitle: "text-base font-bold text-gray-900",
    contactList: "flex flex-wrap justify-between text-sm text-gray-500",
  },

  creative: {
    container:
      "bg-linear-to-br from-purple-50 to-blue-50 p-8 rounded-lg max-w-4xl mx-auto shadow-md",
    nameContainer: "text-center pb-1 mb-2",
    name: "text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent",
    title: "text-base text-gray-500 font-medium",
    sectionHeader:
      "text-lg font-bold mb-1 mt-3 bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent inline-block",
    skills: "flex flex-wrap gap-1",
    skillItem:
      "bg-white bg-opacity-50 backdrop-filter backdrop-blur-xs px-2 py-0.5 rounded-full text-xs border border-purple-200 text-purple-700",
    text: "text-gray-600 text-sm",
    projectTitle: "text-base font-bold text-purple-700",
    projectTech: "text-xs text-blue-500",
    expTitle: "text-base font-bold text-purple-700",
    expDetails: "text-xs text-blue-500",
    eduTitle: "text-base font-bold text-purple-700",
    contactList: "grid grid-cols-2 gap-1 text-gray-600 text-sm",
  },

  professional: {
    container:
      "bg-white p-8 border-l-8 rounded-lg border-gray-700 max-w-4xl mx-auto shadow-md",
    nameContainer: "border-b-2 border-gray-700 pb-1 mb-2",
    name: "text-3xl font-bold text-gray-800",
    title: "text-base text-gray-600 font-medium",
    sectionHeader:
      "text-lg font-bold text-gray-800 mb-1 mt-3 uppercase border-b border-gray-300",
    skills: "grid grid-cols-3 gap-1 sm:grid-cols-4",
    skillItem:
      "bg-gray-100 text-gray-800 px-2 py-0.5 text-center text-xs border-l-2 border-gray-700",
    text: "text-gray-700 leading-tight text-sm",
    projectTitle: "text-base font-bold text-gray-800",
    projectTech:
      "text-xs font-medium text-gray-600 border-l-2 border-gray-400 pl-2",
    expTitle: "text-base font-bold text-gray-800",
    expDetails:
      "text-xs font-medium text-gray-600 border-l-2 border-gray-400 pl-2",
    eduTitle: "text-base font-bold text-gray-800",
    contactList: "grid grid-cols-2 gap-1 text-gray-700 text-sm",
  },

  elegant: {
    container:
      "bg-linear-to-br from-slate-50 to-gray-100 rounded-lg p-8 max-w-4xl mx-auto shadow-lg border border-gray-200",
    nameContainer: "text-center pb-2 mb-2 border-b-2 border-indigo-200",
    name: "text-4xl font-light text-gray-800 tracking-wide",
    title: "text-lg text-indigo-600 font-light italic",
    sectionHeader:
      "text-xl font-light text-indigo-700 mb-1 mt-3 tracking-wide relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-indigo-300",
    skills: "flex flex-wrap gap-2",
    skillItem:
      "bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-light border border-indigo-200",
    text: "text-gray-600 text-sm leading-relaxed",
    projectTitle: "text-lg font-medium text-indigo-700",
    projectTech: "text-xs text-indigo-500 font-light tracking-wide",
    expTitle: "text-lg font-medium text-indigo-700",
    expDetails: "text-sm text-gray-500 font-light",
    eduTitle: "text-lg font- ium text-indigo-700",
    contactList: "grid grid-cols-2 gap-2 text-gray-600 text-sm",
  },

  executive: {
    container:
      "bg-white p-8 max-w-4xl mx-auto rounded-lg shadow-xl border-t-4 border-gray-800",
    nameContainer: "bg-gray-800 text-white p-3 mb-3 -mx-8 -mt-8",
    name: "text-3xl font-bold tracking-tight",
    title: "text-lg font-light opacity-90",
    sectionHeader:
      "text-lg font-bold text-gray-800 mb-1 mt-3 uppercase tracking-wider bg-gray-100 px-2 py-1",
    skills: "grid grid-cols-4 gap-1 sm:grid-cols-5",
    skillItem:
      "bg-gray-800 text-white px-2 py-1 text-center text-xs font-medium",
    text: "text-gray-700 text-sm leading-relaxed",
    projectTitle: "text-base font-bold text-gray-800",
    projectTech:
      "text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 inline-block",
    expTitle: "text-base font-bold text-gray-800",
    expDetails: "text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5",
    eduTitle: "text-base font-bold text-gray-800",
    contactList:
      "bg-gray-800 text-white p-2 -mx-8 -mb-8 grid grid-cols-2 gap-2 text-sm",
  },

  techie: {
    container:
      "bg-gray-900 text-green-400 p-8 rounded-lg max-w-4xl mx-auto shadow-lg border border-green-500 font-mono",
    nameContainer: "border-b border-green-500 pb-1 mb-2",
    name: "text-3xl font-bold text-green-300",
    title: "text-base text-green-500 font-light",
    sectionHeader:
      "text-lg font-bold text-green-300 mb-1 mt-3 uppercase tracking-wider relative before:content-['>>'] before:text-green-500 before:mr-2",
    skills: "flex flex-wrap gap-1",
    skillItem:
      "bg-green-900 text-green-300 px-2 py-0.5 text-xs border border-green-500",
    text: "text-green-400 text-sm leading-tight",
    projectTitle: "text-base font-bold text-green-300",
    projectTech: "text-xs text-green-500 font-mono",
    expTitle: "text-base font-bold text-green-300",
    expDetails: "text-xs text-green-500 font-mono",
    eduTitle: "text-base font-bold text-green-300",
    contactList: "grid grid-cols-2 gap-1 text-green-400 text-sm",
  },

  artistic: {
    container:
      "bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-lg p-8 max-w-4xl mx-auto shadow-lg border-2 border-purple-200",
    nameContainer: "text-center pb-2 mb-2 relative",
    name: "text-4xl font-d bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent",
    title: "text-lg text-purple-600 font-medium italic",
    sectionHeader:
      "text-xl font-bold mb-1 mt-3 bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-linear-to-r after:from-pink-300 after:to-purple-300",
    skills: "flex flex-wrap gap-2",
    skillItem:
      "bg-linear-to-r from-pink-100 to-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 shadow-xs",
    text: "text-gray-700 text-sm leading-relaxed",
    projectTitle:
      "text-lg font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",
    projectTech: "text-xs text-purple-500 font-medium",
    expTitle:
      "text-lg font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",
    expDetails: "text-sm text-purple-500 font-medium",
    eduTitle:
      "text-lg font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",
    contactList: "grid grid-cols-2 gap-2 text-purple-700 text-sm",
  },

  corporate: {
    container:
      "bg-white p-8 max-w-4xl mx-auto rounded-lg shadow-md border-2 border-blue-900",
    nameContainer: "text-center pb-2 mb-3 border-b-4 border-blue-900",
    name: "text-3xl font-bold text-blue-900 uppercase tracking-wide",
    title: "text-base text-blue-700 font-semibold",
    sectionHeader:
      "text-lg font-bold text-blue-900 mb-1 mt-3 uppercase bg-blue-100 px-3 py-1 border-l-4 border-blue-900",
    skills: "grid grid-cols-3 gap-2 sm:grid-cols-4",
    skillItem:
      "bg-blue-900 text-white px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide",
    text: "text-gray-700 text-sm leading-relaxed",
    projectTitle: "text-base font-bold text-blue-900",
    projectTech: "text-xs font-semibold text-blue-700 uppercase tracking-wide",
    expTitle: "text-base font-bold text-blue-900",
    expDetails: "text-xs font-semibold text-blue-700 uppercase tracking-wide",
    eduTitle: "text-base font-bold text-blue-900",
    contactList:
      "bg-blue-900 text-white p-2 -mx-8 -mb-8 grid grid-cols-2 gap-2 text-sm",
  },
};
