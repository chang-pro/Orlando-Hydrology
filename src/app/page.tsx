// page.tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { HydrologyFeature } from "@/types/hydrology";
import FeatureList from "@/components/FeatureList";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center text-black">
      Loading map data...
    </div>
  ),
});

export default function Home() {
  const [features, setFeatures] = useState<HydrologyFeature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<HydrologyFeature | null>(null);

  return (
    <main className="bg-white h-screen flex overflow-hidden">
      <div className="w-96 border-r border-gray-200 p-8 flex flex-col"> {/* Increased width from w-80 to w-96 */}
        <h1 className="text-black text-3xl font-bold">Orlando Hydrology</h1>
        <h2 className="text-red-600 text-2xl font-semibold mt-2">Interactive Map</h2>
        <p className="text-sm text-gray-600 mt-1">by Dechante Chang</p>
        
        <div className="text-gray-800 mt-4 space-y-4">
          <p className="text-base">
            A comprehensive visualization of Orlando's water features, including lakes, ponds, 
            and water bodies. Data provided by the City of Orlando's open data portal.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Project Information</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-medium">Data Source:</span> City of Orlando Open Data Portal</li>
              <li><span className="font-medium">Last Updated:</span> December 14, 2024</li>
              <li><span className="font-medium">Frameworks:</span> Next.js 14, React 18</li>
              <li><span className="font-medium">UI Components:</span> Tailwind CSS, shadcn/ui</li>
              <li><span className="font-medium">Map Library:</span> MapLibre GL JS</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-700">
            Interactive features: Click lakes on the map to highlight and locate them in the list. 
            Select from the list to highlight on the map.
          </p>
        </div>
        
        <hr className="my-4 border-gray-300" />
        
        <div className="flex-1 overflow-y-scroll">
          <h3 className="text-lg font-semibold mb-3">Water Bodies</h3>
          <FeatureList
            features={features}
            selectedFeature={selectedFeature}
            onFeatureSelect={setSelectedFeature}
          />
        </div>
      </div>
      
      <div className="flex-1 relative">
        <Map
          onFeaturesLoaded={setFeatures}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
        />
      </div>
    </main>
  );
}