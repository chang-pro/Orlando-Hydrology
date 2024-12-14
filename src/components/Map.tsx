// Map.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import { HydrologyFeature } from '@/types/hydrology';
import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';

interface MapProps {
  onFeaturesLoaded: (features: HydrologyFeature[]) => void;
  selectedFeature: HydrologyFeature | null;
  onSelectFeature: (feature: HydrologyFeature | null) => void;
}

export default function Map({
  onFeaturesLoaded,
  selectedFeature,
  onSelectFeature,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const dataLoadedRef = useRef(false);
  const featuresRef = useRef<HydrologyFeature[]>([]);

  const updateFeatureState = useCallback((map: MapLibreMap, feature: HydrologyFeature | null) => {
    if (!map.getSource('hydrology')) return;

    // Reset all feature states
    const features = map.querySourceFeatures('hydrology');
    features.forEach((f) => {
      map.setFeatureState(
        { source: 'hydrology', id: f.id },
        { selected: false }
      );
    });

    // Set new selected feature state
    if (feature) {
      const featureIndex = featuresRef.current.findIndex(
        f => f.hydroname === feature.hydroname && 
            JSON.stringify(f.the_geom) === JSON.stringify(feature.the_geom)
      );
      
      if (featureIndex !== -1) {
        features.forEach((f) => {
          if (f.properties?.featureIndex === featureIndex) {
            map.setFeatureState(
              { source: 'hydrology', id: f.id },
              { selected: true }
            );
          }
        });
      }
    }
  }, []);

  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap Contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-opacity': 0.7,
              'raster-brightness-min': 0.2,
              'raster-brightness-max': 0.8,
              'raster-contrast': 0.3,
              'raster-saturation': -0.4
            }
          }
        ]
      },
      center: [-81.3792, 28.5383],
      zoom: 11,
      maxZoom: 18
    });

    mapRef.current = map;

    map.on('style.load', async () => {
      if (dataLoadedRef.current) return;
      dataLoadedRef.current = true;

      try {
        const response = await fetch('https://data.cityoforlando.net/resource/j3uy-fhhx.json');
        if (!response.ok) throw new Error('Failed to fetch data');

        const data: HydrologyFeature[] = await response.json();
        featuresRef.current = data;
        onFeaturesLoaded(data);

        const features: Feature<Geometry, GeoJsonProperties>[] = data
          .map((feature, index) => {
            try {
              const geometry = typeof feature.the_geom === 'string'
                ? JSON.parse(feature.the_geom) as Geometry
                : feature.the_geom as Geometry;
              return {
                type: 'Feature',
                geometry,
                properties: { 
                  ...feature,
                  featureIndex: index
                }
              } as Feature<Geometry, GeoJsonProperties>;
            } catch {
              return null;
            }
          })
          .filter((f): f is Feature<Geometry, GeoJsonProperties> => f !== null);

        const geojsonData: FeatureCollection<Geometry, GeoJsonProperties> = {
          type: 'FeatureCollection',
          features
        };

        map.addSource('hydrology', {
          type: 'geojson',
          data: geojsonData,
          generateId: true
        });

        // Add fill layer for the main color
        map.addLayer({
          id: 'hydrology-fill',
          type: 'fill',
          source: 'hydrology',
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#2196F3',  // Selected color
              '#1976D2'   // Default color
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.9,
              0.8
            ]
          }
        });

        // Add outline layer
        map.addLayer({
          id: 'hydrology-outline',
          type: 'line',
          source: 'hydrology',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FDD835',  // Selected outline
              '#64B5F6'   // Default outline
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              3,
              1
            ]
          }
        });

        map.on('click', 'hydrology-fill', (e) => {
          if (e.features && e.features[0] && e.features[0].properties) {
            const featureIndex = e.features[0].properties.featureIndex;
            const feature = featuresRef.current[featureIndex];
            if (feature) {
              onSelectFeature(feature);
            }
          }
        });

        map.on('mouseenter', 'hydrology-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'hydrology-fill', () => {
          map.getCanvas().style.cursor = '';
        });

      } catch (error) {
        console.error('Error loading hydrology data:', error);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      dataLoadedRef.current = false;
    };
  }, [onFeaturesLoaded, onSelectFeature]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    updateFeatureState(map, selectedFeature);
  }, [selectedFeature, updateFeatureState]);

  return <div ref={mapContainer} className="w-full h-full" />;
}