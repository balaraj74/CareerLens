
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LibrarySquare, Map, Search, Wifi, Loader2, LocateFixed, Star } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
};

const mapLibraries = ['places'] as any;

export function LibraryFinderPage() {
  const { toast } = useToast();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: mapLibraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [libraries, setLibraries] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<google.maps.places.PlaceResult | null>(null);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const findLibrariesNearMe = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation is not supported by your browser' });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(newCenter);
        map?.panTo(newCenter);

        if (!map) {
            setLoading(false);
            return;
        }

        const placesService = new google.maps.places.PlacesService(map);
        const request: google.maps.places.PlaceSearchRequest = {
          location: newCenter,
          radius: 5000, // 5km radius
          type: 'library',
        };

        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setLibraries(results);
          } else {
            toast({ variant: 'destructive', title: 'Could not find libraries' });
          }
          setLoading(false);
        });
      },
      () => {
        toast({ variant: 'destructive', title: 'Unable to retrieve your location' });
        setLoading(false);
      }
    );
  };

  const handleLibraryClick = (library: google.maps.places.PlaceResult) => {
      if (library.geometry?.location) {
          const newCenter = { lat: library.geometry.location.lat(), lng: library.geometry.location.lng() };
          setCenter(newCenter);
          map?.panTo(newCenter);
          map?.setZoom(15);
          setSelectedLibrary(library);
      }
  }

  const memoizedMap = useMemo(() => (
    isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              styles: [
                  {
                      "featureType": "all",
                      "elementType": "labels.text.fill",
                      "stylers": [ { "color": "#ffffff" } ]
                  },
                  {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                      { "visibility": "off" }
                    ]
                  },
                  {
                      "featureType": "administrative",
                      "elementType": "geometry.fill",
                      "stylers": [ { "color": "#212c3b" } ]
                  },
                  {
                      "featureType": "administrative",
                      "elementType": "geometry.stroke",
                      "stylers": [ { "color": "#3a4b64" } ]
                  },
                  {
                      "featureType": "landscape",
                      "elementType": "geometry",
                      "stylers": [ { "color": "#212c3b" } ]
                  },
                  {
                      "featureType": "poi",
                      "elementType": "geometry",
                      "stylers": [ { "color": "#2f4058" } ]
                  },
                   {
                      "featureType": "road",
                      "elementType": "geometry",
                      "stylers": [ { "color": "#3a4b64" } ]
                  },
                  {
                    "featureType": "transit",
                    "elementType": "geometry",
                    "stylers": [
                      { "color": "#2f4058" }
                    ]
                  },
                  {
                      "featureType": "water",
                      "elementType": "geometry",
                      "stylers": [ { "color": "#17212e" } ]
                  }
              ]
          }}
        >
          {libraries.map(lib => lib.geometry?.location && (
              <MarkerF 
                key={lib.place_id} 
                position={lib.geometry.location} 
                onClick={() => handleLibraryClick(lib)}
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: selectedLibrary?.place_id === lib.place_id ? '#FACC15' : '#60A5FA',
                    fillOpacity: 1,
                    strokeColor: '#FFF',
                    strokeWeight: 2,
                    scale: selectedLibrary?.place_id === lib.place_id ? 10 : 7,
                }}
              />
          ))}
        </GoogleMap>
      ) : <Loader2 className="w-8 h-8 animate-spin text-primary" />
  ), [isLoaded, center, onLoad, onUnmount, libraries, selectedLibrary, map]);

  if (loadError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <Map className="h-4 w-4" />
          <AlertTitle>Map Error</AlertTitle>
          <AlertDescription>
            Could not load Google Maps. Please check your API key and network connection.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
                <LibrarySquare className="w-8 h-8 text-primary"/>
                Nearest Library Finder
            </h1>
            <p className="text-muted-foreground">Discover quiet places to study and read near you.</p>
       </motion.div>
       
       <Card className="glass-card">
        <CardHeader>
          <CardTitle>Find a Library</CardTitle>
          <CardDescription>Click the button to use your current location to find libraries in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full sm:w-auto" onClick={findLibrariesNearMe} disabled={loading || !isLoaded}>
            {loading ? <Loader2 className="mr-2 animate-spin" /> : <LocateFixed className="mr-2" />}
            Find Libraries Near Me
          </Button>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            {memoizedMap}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libraries.map((lib) => (
          <Card key={lib.place_id} className={`glass-card hover:-translate-y-1 transition-transform ${selectedLibrary?.place_id === lib.place_id ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
            <CardHeader>
              <CardTitle>{lib.name}</CardTitle>
              <CardDescription>{lib.vicinity}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className={`w-5 h-5 ${lib.rating && lib.rating > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}/>
                <span className="text-sm font-medium">{lib.rating || 'No rating'}</span>
                <span className="text-xs text-muted-foreground">({lib.user_ratings_total || 0} reviews)</span>
              </div>
              <Badge variant={lib.opening_hours?.open_now ? 'default' : 'destructive'} className={lib.opening_hours?.open_now ? 'bg-green-500/20 text-green-300 border-green-500/50' : ''}>
                {lib.opening_hours?.open_now ? 'Open Now' : 'Closed'}
              </Badge>
              <Button variant="outline" className="w-full" onClick={() => handleLibraryClick(lib)}>Show on Map</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
