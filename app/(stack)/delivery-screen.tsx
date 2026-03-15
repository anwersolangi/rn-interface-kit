import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.015;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface LatLng {
  latitude: number;
  longitude: number;
}

const RESTAURANT_LOCATION: LatLng = { latitude: 37.78825, longitude: -122.4324 };
const HOME_LOCATION: LatLng = { latitude: 37.78025, longitude: -122.4194 };

const REALISTIC_ROUTE: LatLng[] = [
  RESTAURANT_LOCATION,
  { latitude: 37.78800, longitude: -122.4320 },
  { latitude: 37.78770, longitude: -122.4312 },
  { latitude: 37.78720, longitude: -122.4300 },
  { latitude: 37.78680, longitude: -122.4288 },
  { latitude: 37.78600, longitude: -122.4265 },
  { latitude: 37.78500, longitude: -122.4252 },
  { latitude: 37.78400, longitude: -122.4238 },
  { latitude: 37.78300, longitude: -122.4222 },
  { latitude: 37.78200, longitude: -122.4208 },
  { latitude: 37.78100, longitude: -122.4198 },
  HOME_LOCATION,
];

const UBER_MAP_STYLE = [
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": 10 }] },
  { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "hidden" }] },
  { "featureType": "administrative.province", "elementType": "geometry", "stylers": [{ "visibility": "hidden" }] },
  { "featureType": "administrative.locality", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#e0e0e0" }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }
];

export default function UberStyleDeliveryTracker() {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const [driverIndex, setDriverIndex] = useState(0);
  const [driverCoords, setDriverCoords] = useState(REALISTIC_ROUTE[0]);
  
  const headerOpacity = useSharedValue(0);
  const carRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const snapPoints = useMemo(() => ['15%', '45%', '85%'], []);

  useEffect(() => {
    headerOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );

    const interval = setInterval(() => {
      setDriverIndex((prev) => {
        if (prev >= REALISTIC_ROUTE.length - 1) return prev;
        
        const currentPos = REALISTIC_ROUTE[prev];
        const nextPos = REALISTIC_ROUTE[prev + 1];
        
        const angle = calculateBearing(currentPos, nextPos);
        carRotation.value = withSpring(angle, { damping: 20, stiffness: 90 });
        
        setDriverCoords(nextPos);
        
        mapRef.current?.animateCamera({
            center: nextPos,
            pitch: 45,
            heading: angle,
            zoom: 17
        }, { duration: 1000 });

        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const calculateBearing = (start: LatLng, end: LatLng) => {
    const startLat = (start.latitude * Math.PI) / 180;
    const startLng = (start.longitude * Math.PI) / 180;
    const endLat = (end.latitude * Math.PI) / 180;
    const endLng = (end.longitude * Math.PI) / 180;
    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
  };

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const carStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${carRotation.value}deg` }] }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.8], [0.6, 0]),
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      

      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={UBER_MAP_STYLE}
        initialRegion={{
          ...REALISTIC_ROUTE[0],
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        pitchEnabled={true}
        rotateEnabled={true}
        camera={{
          center: REALISTIC_ROUTE[0],
          pitch: 50,
          heading: 0,
          altitude: 1000,
          zoom: 16
        }}
        showsUserLocation={false}
        showsCompass={false}
      >
        

        <Polyline
          coordinates={REALISTIC_ROUTE}
          strokeColor="#000"
          strokeWidth={4}
          lineDashPattern={[0]} 
        />

        <Marker coordinate={RESTAURANT_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.markerContainer}>
            <View style={[styles.markerSquare, { backgroundColor: '#000' }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#FFF" />
            </View>
            <View style={styles.markerTail} />
          </View>
        </Marker>

        <Marker coordinate={HOME_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
           <View style={styles.markerContainer}>
            <View style={[styles.markerSquare, { backgroundColor: '#000' }]}>
              <Ionicons name="home" size={16} color="#FFF" />
            </View>
            <View style={styles.markerTail} />
          </View>
        </Marker>

        <Marker coordinate={driverCoords} anchor={{ x: 0.5, y: 0.5 }} flat>
          <View style={styles.carContainer}>
            <Animated.View style={[styles.pulseCircle, pulseStyle]} />
            <Animated.View style={carStyle}>
               <View style={styles.carShape}>
                  <Ionicons name="car-sport" size={28} color="#000" />
               </View>
            </Animated.View>
          </View>
        </Marker>


      </MapView>





      

      <Animated.View style={[styles.header, headerStyle]}>
        <Pressable style={styles.roundButton}>
          <BlurView intensity={80} tint="light" style={styles.blurFill}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </BlurView>
        </Pressable>
        
         <Pressable style={styles.roundButton}>
          <BlurView intensity={80} tint="light" style={styles.blurFill}>
            <Ionicons name="options" size={22} color="#000" />
          </BlurView>
        </Pressable>
      </Animated.View>



      

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          

          <View style={styles.statusSection}>
            <View style={styles.statusLeft}>
                <Text style={styles.statusTitle}>Picking up order</Text>
                <Text style={styles.statusSubtitle}>Arriving by 3:05 PM</Text>
            </View>
            <View style={styles.etaBadge}>
                <Text style={styles.etaTime}>12</Text>
                <Text style={styles.etaUnit}>min</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.driverSection}>
            <View style={styles.driverProfile}>
                <View style={styles.avatarContainer}>
                    <FontAwesome5 name="user-alt" size={24} color="#555" />
                    <View style={styles.verifiedBadge}>
                         <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                </View>
                <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>Michael Jordan</Text>
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingText}>4.9</Text>
                        <Ionicons name="star" size={12} color="#000" />
                        <Text style={styles.vehicleText}> • Toyota Camry • 8HR 522</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.actionButtons}>
                 <Pressable style={styles.actionBtn}>
                     <Ionicons name="call" size={22} color="#000" />
                 </Pressable>
                 <Pressable style={styles.actionBtn}>
                     <Ionicons name="chatbubble" size={22} color="#000" />
                 </Pressable>
            </View>
          </View>

          <View style={styles.orderSection}>
             <View style={styles.orderHeader}>
                 <Text style={styles.sectionHeader}>Order Details</Text>
                 <Text style={styles.receiptLink}>View Receipt</Text>
             </View>
             
             <View style={styles.orderItem}>
                 <View style={styles.quantityBadge}><Text style={styles.qtyText}>2</Text></View>
                 <Text style={styles.itemText}>Margherita Pizza</Text>
             </View>
             <View style={styles.orderItem}>
                 <View style={styles.quantityBadge}><Text style={styles.qtyText}>1</Text></View>
                 <Text style={styles.itemText}>Caesar Salad</Text>
             </View>
          </View>

           <View style={styles.progressSection}>
                <Text style={styles.sectionHeader}>Timeline</Text>
                <View style={styles.timelineRow}>
                    <View style={styles.timelineDotActive} />
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                </View>
                <View style={styles.timelineLabels}>
                    <Text style={[styles.label, {color: '#000'}]}>Preparing</Text>
                    <Text style={styles.label}>On way</Text>
                    <Text style={styles.label}>Arrived</Text>
                </View>
           </View>

           <View style={{height: 50}} /> 


        </BottomSheetScrollView>
      </BottomSheet>




    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerSquare: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000',
    marginTop: -1
  },
  carContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  carShape: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  



  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  roundButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 5 },
    }),
  },
  blurFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  



  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetHandle: { backgroundColor: '#e0e0e0', width: 40, height: 4 },
  sheetContent: { paddingHorizontal: 24, paddingTop: 10 },
  statusSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusLeft: {},
  statusTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' },
  statusSubtitle: { fontSize: 14, color: '#757575', marginTop: 4, fontWeight: '500' },
  etaBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: 'center',
  },
  etaTime: { color: '#fff', fontSize: 16, fontWeight: '700' },
  etaUnit: { color: '#fff', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 },
  driverSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  driverProfile: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#27ae60',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  driverInfo: { justifyContent: 'center' },
  driverName: { fontSize: 16, fontWeight: '700', color: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', marginRight: 2 },
  vehicleText: { fontSize: 12, color: '#757575' },
  actionButtons: { flexDirection: 'row' },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
  orderSection: { marginBottom: 24 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  receiptLink: { color: '#27ae60', fontSize: 14, fontWeight: '600' },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  quantityBadge: {
    backgroundColor: '#f5f5f5',
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  qtyText: { fontSize: 12, fontWeight: '700' },
  itemText: { fontSize: 15, color: '#333' },
  progressSection: { marginBottom: 20 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  timelineDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e0e0e0' },
  timelineLine: { flex: 1, height: 2, backgroundColor: '#f0f0f0', marginHorizontal: 4 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  label: { fontSize: 12, color: '#999', fontWeight: '600' }


});



