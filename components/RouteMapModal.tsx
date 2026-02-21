import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Lazy-loaded on native only (web uses iframe)
const WebViewComponent: React.ComponentType<any> | null =
  Platform.OS !== "web"
    ? require("react-native-webview").WebView
    : null;
import type { TimelineStop } from "@/types";
import { getRoute, formatDuration, formatKm, type TravelMode, type FullRoute } from "@/lib/routing";

interface Props {
  visible: boolean;
  stops: TimelineStop[];
  onClose: () => void;
}

const COLORS = ["#A78BFA", "#2DD4BF", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#10B981", "#8B5CF6"];

function buildLeafletHTML(
  stops: TimelineStop[],
  route: FullRoute | null,
  mode: TravelMode,
): string {
  const validStops = stops.filter((s) => s.latitude && s.longitude);
  if (validStops.length === 0) {
    return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#64748B">
      <p>Нет координат для отображения маршрута</p></body></html>`;
  }

  const center = {
    lat: validStops.reduce((s, p) => s + (p.latitude || 0), 0) / validStops.length,
    lng: validStops.reduce((s, p) => s + (p.longitude || 0), 0) / validStops.length,
  };

  const markersJS = validStops
    .map((stop, i) => {
      const color = COLORS[i % COLORS.length];
      const segment = route?.segments?.[i - 1];
      const segInfo = segment
        ? `<br/><small style="color:#7C3AED">${mode === "car" ? "🚗" : "🚶"} ${formatDuration(segment.durationMinutes)} · ${formatKm(segment.distanceKm)}</small>`
        : "";
      return `
        L.circleMarker([${stop.latitude}, ${stop.longitude}], {
          radius: 14, fillColor: '${color}', color: '#fff', weight: 3, fillOpacity: 1
        }).addTo(map)
          .bindPopup('<b>${(i + 1)}. ${stop.title.replace(/'/g, "\\'")}</b>${stop.time ? "<br/>" + stop.time : ""}${segInfo}');
        L.marker([${stop.latitude}, ${stop.longitude}], {
          icon: L.divIcon({
            className: 'num-icon',
            html: '<div style="color:#fff;font-weight:800;font-size:12px;text-align:center;line-height:28px">${i + 1}</div>',
            iconSize: [28, 28], iconAnchor: [14, 14]
          })
        }).addTo(map);`;
    })
    .join("\n");

  // Segment time badges between stops
  const badgesJS = (route?.segments || [])
    .map((seg, i) => {
      const fromStop = validStops[i];
      const toStop = validStops[i + 1];
      if (!fromStop || !toStop) return "";
      const midLat = ((fromStop.latitude || 0) + (toStop.latitude || 0)) / 2;
      const midLng = ((fromStop.longitude || 0) + (toStop.longitude || 0)) / 2;
      const icon = mode === "car" ? "🚗" : "🚶";
      return `
        L.marker([${midLat}, ${midLng}], {
          icon: L.divIcon({
            className: 'time-badge',
            html: '<div style="background:#7C3AED;color:#fff;padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2)">${icon} ${formatDuration(seg.durationMinutes)}</div>',
            iconSize: [80, 24], iconAnchor: [40, 12]
          })
        }).addTo(map);`;
    })
    .join("\n");

  // Use real route geometry or fallback to straight lines
  let polylineJS: string;
  if (route?.geometry && route.geometry.length > 0) {
    const routeCoords = route.geometry.map((p) => `[${p[0]}, ${p[1]}]`).join(",");
    polylineJS = `L.polyline([${routeCoords}],{color:'#7C3AED',weight:5,opacity:0.85,lineCap:'round',lineJoin:'round'}).addTo(map);`;
  } else {
    const fallbackCoords = validStops.map((s) => `[${s.latitude}, ${s.longitude}]`).join(",");
    polylineJS = `L.polyline([${fallbackCoords}],{color:'#A78BFA',weight:4,opacity:0.8,dashArray:'8,12',lineCap:'round'}).addTo(map);`;
  }

  const bounds = validStops.map((s) => `[${s.latitude}, ${s.longitude}]`).join(",");

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{height:100%;width:100%}
    #map{height:100%;width:100%}
    .num-icon{background:transparent!important;border:none!important}
    .time-badge{background:transparent!important;border:none!important}
    .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
    .leaflet-popup-content{margin:12px 16px;font-family:-apple-system,sans-serif;font-size:13px;line-height:1.5}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map',{zoomControl:false});
    L.control.zoom({position:'bottomright'}).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
      attribution:'OpenStreetMap',maxZoom:19
    }).addTo(map);
    ${markersJS}
    ${polylineJS}
    ${badgesJS}
    map.fitBounds([${bounds}],{padding:[50,50]});
  </script>
</body>
</html>`;
}

export default function RouteMapModal({ visible, stops, onClose }: Props) {
  const [mode, setMode] = useState<TravelMode>("foot");
  const [route, setRoute] = useState<FullRoute | null>(null);
  const [loading, setLoading] = useState(false);

  const validStops = useMemo(() => stops.filter((s) => s.latitude && s.longitude), [stops]);

  useEffect(() => {
    if (!visible || validStops.length < 2) {
      setRoute(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const waypoints = validStops.map((s) => ({ latitude: s.latitude!, longitude: s.longitude! }));
    getRoute(waypoints, mode).then((r) => {
      if (!cancelled) {
        setRoute(r);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [visible, validStops, mode]);

  const html = useMemo(() => buildLeafletHTML(stops, route, mode), [stops, route, mode]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Маршрут</Text>
          <View style={styles.headerRight}>
            <Text style={styles.stopsCount}>{validStops.length} мест</Text>
          </View>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "foot" && styles.modeActive]}
            onPress={() => setMode("foot")}
          >
            <Ionicons name="walk" size={18} color={mode === "foot" ? "#FFF" : "#64748B"} />
            <Text style={[styles.modeText, mode === "foot" && styles.modeTextActive]}>Пешком</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === "car" && styles.modeActive]}
            onPress={() => setMode("car")}
          >
            <Ionicons name="car" size={18} color={mode === "car" ? "#FFF" : "#64748B"} />
            <Text style={[styles.modeText, mode === "car" && styles.modeTextActive]}>На машине</Text>
          </TouchableOpacity>
          {route && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>
                {formatDuration(route.totalDurationMinutes)} · {formatKm(route.totalDistanceKm)}
              </Text>
            </View>
          )}
          {loading && <ActivityIndicator size="small" color="#7C3AED" style={{ marginLeft: 8 }} />}
        </View>

        <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
            <iframe
              srcDoc={html}
              style={{ width: "100%", height: "100%", border: "none" } as any}
              title="Route Map"
            />
          ) : WebViewComponent ? (
            <WebViewComponent
              source={{ html }}
              style={{ flex: 1 }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.fallback}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.fallbackText}>Loading map...</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.fallback}>
              <Ionicons name="map-outline" size={48} color="#A78BFA" />
              <Text style={styles.fallbackText}>Map unavailable</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.legend} contentContainerStyle={styles.legendContent}>
          {validStops.map((stop, i) => {
            const segment = route?.segments?.[i - 1];
            return (
              <View key={stop.id}>
                {segment && i > 0 && (
                  <View style={styles.segmentRow}>
                    <View style={styles.segmentLine} />
                    <View style={styles.segmentBadge}>
                      <Ionicons
                        name={mode === "car" ? "car-outline" : "walk-outline"}
                        size={12}
                        color="#7C3AED"
                      />
                      <Text style={styles.segmentText}>
                        {formatDuration(segment.durationMinutes)} · {formatKm(segment.distanceKm)}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS[i % COLORS.length] }]}>
                    <Text style={styles.legendDotText}>{i + 1}</Text>
                  </View>
                  <View style={styles.legendInfo}>
                    <Text style={styles.legendTitle} numberOfLines={1}>{stop.title}</Text>
                    {stop.time ? <Text style={styles.legendSub}>{stop.time}</Text> : null}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "web" ? 16 : 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  headerRight: { backgroundColor: "#EDE9FE", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  stopsCount: { fontSize: 13, fontWeight: "600", color: "#7C3AED" },

  modeRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 8,
  },
  modeButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  modeActive: { backgroundColor: "#7C3AED" },
  modeText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  modeTextActive: { color: "#FFF" },
  totalBadge: {
    marginLeft: "auto", backgroundColor: "#EDE9FE",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  totalText: { fontSize: 12, fontWeight: "700", color: "#7C3AED" },

  mapContainer: { flex: 1 },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  fallbackText: { fontSize: 15, color: "#64748B" },

  legend: {
    backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#F1F5F9", maxHeight: 220,
  },
  legendContent: { paddingHorizontal: 16, paddingVertical: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: {
    width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  legendDotText: { color: "#FFF", fontWeight: "800", fontSize: 12 },
  legendInfo: { flex: 1 },
  legendTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  legendSub: { fontSize: 12, color: "#94A3B8" },

  segmentRow: {
    flexDirection: "row", alignItems: "center", paddingLeft: 13, marginVertical: 4,
  },
  segmentLine: {
    width: 2, height: 20, backgroundColor: "#E2E8F0", marginRight: 12,
  },
  segmentBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F5F3FF", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  segmentText: { fontSize: 11, fontWeight: "600", color: "#7C3AED" },
});
