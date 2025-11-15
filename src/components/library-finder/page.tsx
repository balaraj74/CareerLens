
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LibrarySquare, Map, Loader2, LocateFixed, Star, MapPin, Navigation } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '1rem',
};

const mapLibraries: ('places')[] = ['places'];


export function LibraryFinderPage() {
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: mapLibraries,
    version: 'weekly', // Use the latest version with new Places API
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [libraries, setLibraries] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedLibrary, setSelectedLibrary] = useState<google.maps.places.PlaceResult | null>(null);

  // Check location permission on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
        
        // Auto-get location if already granted
        if (result.state === 'granted') {
          getUserLocation();
        }
      });
    }
  }, []);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: '❌ Geolocation Not Supported',
        description: 'Your browser does not support location services. Please use a modern browser like Chrome, Firefox, or Safari.',
      });
      return Promise.reject('Geolocation not supported');
    }

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setCenter(location);
          setLocationPermission('granted');
          
          toast({
            title: '✅ Location Enabled',
            description: `Found your location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          });
          
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to access your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              setLocationPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your device settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          toast({
            variant: 'destructive',
            title: '❌ Location Error',
            description: errorMessage,
          });
          
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [toast]);

  const searchLibraries = useCallback((location: { lat: number; lng: number }) => {
    if (!map) {
      toast({
        variant: 'destructive',
        title: '⏳ Map Not Ready',
        description: 'The map is still loading. Please wait a moment and try again.',
      });
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      toast({
        variant: 'destructive',
        title: '❌ Places API Not Loaded',
        description: 'Google Places API is not loaded. Please refresh the page.',
      });
      return;
    }

    setLoading(true);
    setLibraries([]);
    setSelectedLibrary(null);

    // Pan and zoom to location
    map.panTo(location);
    map.setZoom(14);

    // Use legacy Places API (still works with existing enabled API)
    const service = new google.maps.places.PlacesService(map);
    const request: google.maps.places.PlaceSearchRequest = {
      location: location,
      radius: 5000, // Search within 5km
      type: 'library',
      keyword: 'library public',
    };

    service.nearbySearch(request, (results, status) => {
      setLoading(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        setLibraries(results);
        toast({
          title: '📚 Libraries Found',
          description: `Found ${results.length} ${results.length === 1 ? 'library' : 'libraries'} within 5km of your location.`,
        });
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        toast({
          variant: 'destructive',
          title: '😔 No Libraries Found',
          description: 'No libraries found within 5km. Try searching in a different area.',
        });
      } else {
        let errorMessage = 'Could not find libraries nearby.';
        
        switch (status) {
          case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
            errorMessage = 'Request denied. Please enable "Places API" in Google Cloud Console at: https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=202306950137';
            break;
          case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
            errorMessage = 'Query limit exceeded. Please try again later.';
            break;
          case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
            errorMessage = 'Invalid request. Please try again.';
            break;
        }
        
        toast({
          variant: 'destructive',
          title: '❌ Search Failed',
          description: errorMessage,
        });
      }
    });
  }, [map, toast]);

  const findLibrariesNearMe = useCallback(async () => {
    try {
      setLoading(true);
      const location = await getUserLocation();
      searchLibraries(location);
    } catch (error) {
      setLoading(false);
    }
  }, [getUserLocation, searchLibraries]);

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

    // Default center (India - Bangalore) if user location not available
    const defaultCenter = { lat: 12.9716, lng: 77.5946 };

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || defaultCenter}
        zoom={center ? 13 : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* User location marker */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#10B981', // green-500
              fillOpacity: 0.8,
              strokeColor: '#FFF',
              strokeWeight: 3,
              scale: 8,
            }}
            title="Your Location"
          />
        )}
        
        {/* Library markers */}
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
                title={lib.name}
              />
            )
        )}
      </GoogleMap>
    );
  }, [isLoaded, center, userLocation, onLoad, onUnmount, mapOptions, libraries, selectedLibrary, handleLibraryClick]);

  if (loadError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <Map className="h-4 w-4" />
          <AlertTitle>❌ Map Error</AlertTitle>
          <AlertDescription>
            Failed to load Google Maps. Please verify that:
            <ul className="mt-2 ml-4 list-disc space-y-2">
              <li>Google Maps API key is configured in environment variables</li>
              <li>
                <strong>Maps JavaScript API</strong> is enabled:{' '}
                <a 
                  href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com?project=202306950137"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Enable Here
                </a>
              </li>
              <li>
                <strong>Places API</strong> is enabled:{' '}
                <a 
                  href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=202306950137"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Enable Here
                </a>
              </li>
              <li>Billing is enabled for your Google Cloud project</li>
            </ul>
            <p className="mt-3 text-sm">
              After enabling APIs, wait 2-3 minutes before refreshing the page.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
          <LibrarySquare className="w-8 h-8 text-primary" />
          Nearest Library Finder
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover quiet places to study and read near you.
        </p>
      </motion.div>

      {/* Location Permission Alert */}
      {locationPermission === 'denied' && (
        <Alert variant="destructive">
          <MapPin className="h-4 w-4" />
          <AlertTitle>Location Access Denied</AlertTitle>
          <AlertDescription>
            Please enable location access in your browser settings to find libraries near you.
            <br />
            <span className="text-xs mt-2 block">
              Chrome: Settings → Privacy and security → Site settings → Location
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      {userLocation && (
        <Card className="glass-card border-green-500/50 bg-green-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-2">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-400">Location Enabled</p>
                <p className="text-xs text-muted-foreground">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Find a Library</CardTitle>
          <CardDescription>
            Click the button below to enable location access and find libraries within 5km of your current location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={findLibrariesNearMe}
            disabled={loading || !isLoaded}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching for Libraries...
              </>
            ) : (
              <>
                <LocateFixed className="mr-2 h-4 w-4" />
                Find Libraries Near Me
              </>
            )}
          </Button>
          
          {!userLocation && !loading && (
            <p className="text-xs text-muted-foreground">
              💡 Tip: Make sure location services are enabled on your device and browser.
            </p>
          )}
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
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LibrarySquare className="w-5 h-5 text-primary" />
            Found {libraries.length} {libraries.length === 1 ? 'Library' : 'Libraries'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries.map((lib) => (
              <Card
                key={lib.place_id}
                className={`glass-card hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                  selectedLibrary?.place_id === lib.place_id
                    ? 'border-primary ring-2 ring-primary shadow-lg shadow-primary/20'
                    : ''
                }`}
                onClick={() => handleLibraryClick(lib)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">{lib.name}</CardTitle>
                  <CardDescription className="line-clamp-2 flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {lib.vicinity}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star
                      className={`w-5 h-5 ${
                        lib.rating && lib.rating > 0
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {lib.rating ? lib.rating.toFixed(1) : 'No rating'}
                    </span>
                    {lib.user_ratings_total && lib.user_ratings_total > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({lib.user_ratings_total} reviews)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {lib.opening_hours?.open_now !== undefined && (
                      <Badge
                        variant={lib.opening_hours?.open_now ? 'default' : 'destructive'}
                        className={
                          lib.opening_hours?.open_now
                            ? 'bg-green-500/20 text-green-300 border-green-500/50'
                            : ''
                        }
                      >
                        {lib.opening_hours?.open_now ? '🟢 Open Now' : '🔴 Closed'}
                      </Badge>
                    )}
                  </div>

                  {lib.geometry?.location && userLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        const lat = lib.geometry!.location!.lat();
                        const lng = lib.geometry!.location!.lng();
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No libraries message */}
      {!loading && libraries.length === 0 && userLocation && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <LibrarySquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Libraries Found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't find any libraries within 5km of your location.
              <br />
              Try searching in a different area or check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LibraryFinderPage;
