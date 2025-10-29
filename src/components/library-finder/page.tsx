
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LibrarySquare, Map, Loader2, LocateFixed, Star } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
};

export function LibraryFinderPage() {
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 }); // NYC
  const [libraries, setLibraries] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<google.maps.places.PlaceResult | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const findLibrariesNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }

    if (!map) {
        toast({
            variant: 'destructive',
            title: 'Map not ready',
            description: 'The map is still loading, please try again in a moment.'
        });
        return;
    }

    setLoading(true);
    setLibraries([]);
    setSelectedLibrary(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(newCenter);
        map?.panTo(newCenter);
        map?.setZoom(13);

        const service = new google.maps.places.PlacesService(map);
        const request: google.maps.places.PlaceSearchRequest = {
          location: newCenter,
          radius: 5000, // Search within 5km
          type: 'library',
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setLibraries(results);
          } else {
            toast({
              variant: 'destructive',
              title: 'Search failed',
              description: 'Could not find libraries nearby. Status: ' + status,
            });
          }
          setLoading(false);
        });
      },
      () => {
        toast({
          variant: 'destructive',
          title: 'Location error',
          description: 'Unable to access your current location. Please check your browser permissions.',
        });
        setLoading(false);
      }
    );
  }, [map, toast]);

  const handleLibraryClick = useCallback(
    (library: google.maps.places.PlaceResult) => {
      if (library.geometry?.location && map) {
        const newCenter = {
          lat: library.geometry.location.lat(),
          lng: library.geometry.location.lng(),
        };
        map.panTo(newCenter);
        map.setZoom(15);
        setSelectedLibrary(library);
      }
    },
    [map]
  );
  
    const mapOptions = useMemo(() => ({
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }],
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }],
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }],
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }],
            },
        ],
    }), []);

  const memoizedMap = useMemo(() => {
    if (!isLoaded)
      return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {libraries.map(
          (lib) =>
            lib.geometry?.location && (
              <MarkerF
                key={lib.place_id}
                position={lib.geometry.location}
                onClick={() => handleLibraryClick(lib)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor:
                    selectedLibrary?.place_id === lib.place_id
                      ? '#FACC15' // yellow-400
                      : '#60A5FA', // blue-400
                  fillOpacity: 1,
                  strokeColor: '#FFF',
                  strokeWeight: 2,
                  scale:
                    selectedLibrary?.place_id === lib.place_id ? 10 : 7,
                }}
              />
            )
        )}
      </GoogleMap>
    );
  }, [isLoaded, center, onLoad, onUnmount, mapOptions, libraries, selectedLibrary, handleLibraryClick]);

  if (loadError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <Map className="h-4 w-4" />
          <AlertTitle>Map Error</AlertTitle>
          <AlertDescription>
            Failed to load Google Maps. Please verify your API key and ensure it is enabled for this project.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
          <LibrarySquare className="w-8 h-8 text-primary" />
          Nearest Library Finder
        </h1>
        <p className="text-muted-foreground">
          Discover quiet places to study and read near you.
        </p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Find a Library</CardTitle>
          <CardDescription>
            Use your current location to find libraries nearby.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={findLibrariesNearMe}
            disabled={loading || !isLoaded}
          >
            {loading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <LocateFixed className="mr-2" />
            )}
            Find Libraries Near Me
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
            {memoizedMap}
          </div>
        </CardContent>
      </Card>

      {libraries.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraries.map((lib) => (
            <Card
              key={lib.place_id}
              className={`glass-card hover:-translate-y-1 transition-transform cursor-pointer ${
                selectedLibrary?.place_id === lib.place_id
                  ? 'border-primary ring-2 ring-primary shadow-lg shadow-primary/20'
                  : ''
              }`}
               onClick={() => handleLibraryClick(lib)}
            >
              <CardHeader>
                <CardTitle>{lib.name}</CardTitle>
                <CardDescription>{lib.vicinity}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star
                    className={`w-5 h-5 ${
                      lib.rating && lib.rating > 0
                        ? 'text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {lib.rating || 'No rating'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({lib.user_ratings_total || 0} reviews)
                  </span>
                </div>
                <Badge
                  variant={
                    lib.opening_hours?.open_now ? 'default' : 'destructive'
                  }
                  className={
                    lib.opening_hours?.open_now
                      ? 'bg-green-500/20 text-green-300 border-green-500/50'
                      : ''
                  }
                >
                  {lib.opening_hours?.open_now ? 'Open Now' : 'Closed'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryFinderPage;
