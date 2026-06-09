import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

// Haversine formula for distance calculation
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // km
  const f1 = (lat1 * Math.PI) / 180;
  const f2 = (lat2 * Math.PI) / 180;
  const df = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(df/2)**2 + Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

interface Library {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: string;
  address: string;
  amenities: string[];
}

export default function LibraryFinder() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mockLibraries: Library[] = [
    {
      id: 'lib1',
      name: 'State Central Library',
      latitude: 12.9708,
      longitude: 77.5969,
      rating: '4.6',
      address: 'Cubbon Park, Bengaluru, Karnataka 560001',
      amenities: ['Free WiFi', 'Quiet Study Area', 'AC Rooms', 'Laptop Charging'],
    },
    {
      id: 'lib2',
      name: 'British Council Library',
      latitude: 12.9756,
      longitude: 77.5991,
      rating: '4.8',
      address: 'Prestige Takt, 23 Kasturba Road, Bengaluru 560001',
      amenities: ['Digital Archive', 'Discussion Rooms', 'Coffee Corner'],
    },
    {
      id: 'lib3',
      name: 'South Bengaluru Public Library',
      latitude: 12.9348,
      longitude: 77.6109,
      rating: '4.3',
      address: 'Koramangala 3rd Block, Bengaluru 560034',
      amenities: ['Study desks', 'AC Rooms', 'Local Daily News papers'],
    },
  ];

  const [libraries, setLibraries] = useState<Library[]>(mockLibraries);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location access permission was denied. Showing libraries with default center.');
        setLibraries(mockLibraries);
        setIsLoading(false);
        return;
      }

      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
        
        // Fetch dynamic libraries from Gemini
        const prompt = `
          Find 3 real public libraries or study spaces near latitude ${userLocation.coords.latitude} and longitude ${userLocation.coords.longitude}.
          Return ONLY valid JSON in this format:
          [
            {
              "id": "unique-id",
              "name": "Library Name",
              "latitude": 12.97,
              "longitude": 77.59,
              "rating": "4.5",
              "address": "Full Address",
              "amenities": ["WiFi", "AC"]
            }
          ]
        `;
        const data = extractJSON(await gemini.generateContent(prompt));
        
        if (Array.isArray(data) && data.length > 0) {
          setLibraries(data);
        } else {
          setLibraries(mockLibraries);
        }
      } catch (e) {
        console.error(e);
        setErrorMsg('Could not fetch dynamic libraries. Using standard ones.');
        setLibraries(mockLibraries);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const userLat = location?.coords?.latitude || 12.9716;
  const userLng = location?.coords?.longitude || 77.5946;

  const handleGetDirections = (lib: Library) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lib.latitude},${lib.longitude}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Directions Error', 'Could not open navigation map application.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={GRADIENTS.screenLight as any}
          style={StyleSheet.absoluteFill}
        />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
          </TouchableOpacity>
          <Text style={styles.title}>Library Finder</Text>
          <Text style={styles.subtitle}>Locate workspace and public libraries near you</Text>
        </View>

        {/* GPS STATE BOX */}
        <GlassCard style={styles.gpsCard} gradientColors={['rgba(0, 229, 255, 0.08)', 'rgba(0, 229, 255, 0.02)']}>
          {isLoading ? (
            <View style={styles.gpsLoaderRow}>
              <ActivityIndicator size="small" color={COLORS.secondary[500]} />
              <Text style={styles.gpsText}>Acquiring GPS coordinates...</Text>
            </View>
          ) : (
            <View style={styles.gpsRow}>
              <Ionicons name="navigate-circle" size={20} color={COLORS.emerald[500]} />
              <View style={styles.gpsTextCol}>
                <Text style={styles.gpsStatusText}>
                  {location ? 'GPS Active' : 'Fallback Location'}
                </Text>
                <Text style={styles.gpsCoordsText}>
                  Lat: {userLat.toFixed(4)}° • Lng: {userLng.toFixed(4)}°
                </Text>
              </View>
            </View>
          )}
        </GlassCard>

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* NEAREST LIBRARIES LIST */}
        <Text style={styles.sectionHeader}>Closest Study Desks</Text>
        <View style={styles.librariesList}>
          {libraries.map((lib) => {
            const distance = haversineDistance(userLat, userLng, lib.latitude, lib.longitude);
            return (
              <GlassCard key={lib.id} style={styles.libCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.libName}>{lib.name}</Text>
                    <Text style={styles.libAddress}>{lib.address}</Text>
                  </View>
                  <View style={styles.distBadge}>
                    <Text style={styles.distValue}>{distance.toFixed(1)} km</Text>
                  </View>
                </View>

                {/* Rating & reviews */}
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={COLORS.amber[500]} />
                  <Text style={styles.ratingText}>{lib.rating} (Local Guide reviews)</Text>
                </View>

                {/* Amenities */}
                <View style={styles.amenitiesContainer}>
                  {lib.amenities.map((amenity) => (
                    <View key={amenity} style={styles.amenityChip}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>

                {/* Directions trigger button */}
                <TouchableOpacity style={styles.directionsBtn} onPress={() => handleGetDirections(lib)}>
                  <Ionicons name="map" size={16} color={COLORS.bg.base} />
                  <Text style={styles.directionsText}>Get Directions</Text>
                </TouchableOpacity>
              </GlassCard>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.base,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.primary[500],
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'System',
  },
  gpsCard: {
    marginBottom: 24,
  },
  gpsLoaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gpsText: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsStatusText: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'System',
  },
  gpsCoordsText: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'System',
  },
  errorText: {
    color: COLORS.amber[500],
    fontSize: 12,
    marginBottom: 16,
    fontFamily: 'System',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    fontFamily: 'System',
  },
  librariesList: {
    gap: 12,
  },
  libCard: {
    padding: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderInfo: {
    flex: 1,
    marginRight: 10,
  },
  libName: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'System',
  },
  libAddress: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'System',
  },
  distBadge: {
    backgroundColor: COLORS.emerald.subtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  distValue: {
    color: COLORS.emerald[500],
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'System',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginLeft: 4,
    fontFamily: 'System',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 12,
  },
  amenityChip: {
    backgroundColor: COLORS.secondary[200],
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  amenityText: {
    color: COLORS.text.muted,
    fontSize: 10,
    fontFamily: 'System',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald[500],
    borderRadius: 12,
    height: 38,
    gap: 6,
  },
  directionsText: {
    color: COLORS.bg.base,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
});
