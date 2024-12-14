// components/FeatureList.tsx
import React, { useEffect, useRef } from 'react';
import { HydrologyFeature } from '@/types/hydrology';

interface FeatureListProps {
  features: HydrologyFeature[];
  selectedFeature: HydrologyFeature | null;
  onFeatureSelect: (feature: HydrologyFeature) => void;
}

export default function FeatureList({ features, selectedFeature, onFeatureSelect }: FeatureListProps) {
  const listRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (selectedFeature) {
      const key = `${selectedFeature.hydroname}-${JSON.stringify(selectedFeature.the_geom)}`;
      listRefs.current.get(key)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFeature]);

  const setButtonRef = (key: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      listRefs.current.set(key, element);
    } else {
      listRefs.current.delete(key);
    }
  };

  return (
    <div className="space-y-2"> {/* Increased spacing */}
      {features.map((feature, index) => {
        const key = `${feature.hydroname}-${JSON.stringify(feature.the_geom)}`;
        const isSelected = selectedFeature?.hydroname === feature.hydroname && 
                          JSON.stringify(selectedFeature.the_geom) === JSON.stringify(feature.the_geom);

        return (
          <button
            key={key}
            ref={setButtonRef(key)}
            className={`w-full text-left px-4 py-4 rounded transition-all ${
              isSelected ? 'bg-blue-100 text-black' : 'hover:bg-gray-50 text-black'
            }`}
            onClick={() => onFeatureSelect(feature)}
          >
            <h3 className="text-base font-medium flex items-center"> {/* Increased text size */}
              <span className="h-4 w-4 rounded-full bg-blue-500 inline-block mr-3" /> {/* Increased dot size */}
              {feature.hydroname}
            </h3>
            <p className="text-sm text-gray-700 mt-1 ml-7">{feature.hydrotype.toLowerCase()}</p>
          </button>
        );
      })}
    </div>
  );
}