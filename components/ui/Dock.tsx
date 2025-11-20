import React from 'react';

export const Dock: React.FC = () => {
  // Helper to render icon content
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Finder':
        return (
          <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-white/20">
            <div className="w-full h-[50%] bg-white/20 absolute top-0"></div>
            <div className="text-white text-2xl font-bold select-none">☺︎</div>
          </div>
        );
      case 'Launchpad':
        return (
          <div className="w-full h-full bg-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/20">
             <div className="grid grid-cols-3 gap-0.5">
               {[...Array(9)].map((_,i) => <div key={i} className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>)}
             </div>
          </div>
        );
      case 'Safari':
        return (
           <div className="w-full h-full bg-white rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner border border-gray-200">
             <div className="w-full h-full bg-blue-400 rounded-full scale-90 flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 rotate-45 absolute"></div>
                <div className="w-0.5 h-full bg-red-500 rotate-45 absolute"></div>
                <div className="w-[80%] h-[80%] border border-white/30 rounded-full"></div>
             </div>
           </div>
        );
      case 'Messages':
        return (
          <div className="w-full h-full bg-green-500 rounded-xl flex items-center justify-center border border-white/20">
             <div className="bg-white w-8 h-6 rounded-lg relative">
               <div className="absolute bottom-[-4px] left-2 w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-white border-r-[4px] border-r-transparent"></div>
             </div>
          </div>
        );
      case 'Mail':
        return (
          <div className="w-full h-full bg-blue-500 rounded-xl flex items-center justify-center border border-white/20">
             <div className="w-8 h-6 bg-white/90 relative overflow-hidden rounded-sm flex items-center justify-center">
               <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-500"></div>
               <div className="w-6 h-4 border-b-2 border-blue-500 rotate-45 -translate-y-2"></div>
             </div>
          </div>
        );
      case 'Photos':
        return (
          <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
            <div className="flex flex-wrap w-8 h-8 rotate-12">
               <div className="w-4 h-2 bg-orange-400 rounded-full"></div>
               <div className="w-4 h-2 bg-yellow-400 rounded-full"></div>
               <div className="w-4 h-2 bg-green-400 rounded-full"></div>
               <div className="w-4 h-2 bg-blue-400 rounded-full"></div>
               <div className="w-4 h-2 bg-purple-400 rounded-full"></div>
               <div className="w-4 h-2 bg-red-400 rounded-full"></div>
            </div>
          </div>
        );
      case 'System Settings':
        return (
          <div className="w-full h-full bg-gray-400 rounded-xl flex items-center justify-center border border-white/20">
             <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full border-4 border-gray-500 border-dashed animate-spin-slow"></div>
          </div>
        );
      default:
        return <div className="w-full h-full bg-gray-500 rounded-xl"></div>;
    }
  };

  const apps = ['Finder', 'Launchpad', 'Safari', 'Messages', 'Mail', 'Photos', 'System Settings'];

  return (
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40 mb-2">
      <div className="bg-white/20 backdrop-blur-2xl border border-white/20 rounded-3xl px-4 py-3 flex gap-3 shadow-2xl transition-all duration-300 hover:scale-105">
        {apps.map((app, i) => (
          <div key={i} className="group relative flex flex-col items-center w-12 h-12 transition-all duration-200 hover:-translate-y-4 hover:scale-125 cursor-pointer">
             <div className="w-full h-full shadow-lg rounded-xl overflow-visible">
               {renderIcon(app)}
             </div>
             <div className="w-1 h-1 bg-black/40 rounded-full mt-1 absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
        
        {/* Separator */}
        <div className="w-[1px] h-10 bg-white/30 mx-1 self-center"></div>
        
        {/* Trash */}
        <div className="group relative flex flex-col items-center w-12 h-12 transition-all duration-200 hover:-translate-y-4 hover:scale-125 cursor-pointer">
           <div className="w-full h-full bg-white/80 rounded-full flex items-center justify-center border border-gray-300 shadow-lg">
             <span className="text-xl">🗑️</span>
           </div>
        </div>

      </div>
    </div>
  );
};