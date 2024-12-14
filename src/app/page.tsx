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
    <main className="relative min-h-screen bg-white">
      {/* Desktop layout - fixed map */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:right-0 md:w-[calc(100%-384px)] md:h-full">
        <Map
          onFeaturesLoaded={setFeatures}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
        />
      </div>

      {/* Content container */}
      <div className="md:w-96 w-full bg-white md:min-h-screen relative z-10">
        {/* Top content section */}
        <div className="p-6 md:p-8">
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
        </div>

        {/* Mobile map - between content sections */}
        <div className="md:hidden w-full h-[50vh]">
          <Map
            onFeaturesLoaded={setFeatures}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
          />
        </div>

        {/* Bottom content section with scrollable list */}
        <div className="p-6 md:p-8">
          <hr className="my-4 border-gray-300" />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Water Bodies</h3>
            <div className="h-[300px] overflow-y-auto border rounded-lg bg-gray-50">
              <FeatureList
                features={features}
                selectedFeature={selectedFeature}
                onFeatureSelect={setSelectedFeature}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}