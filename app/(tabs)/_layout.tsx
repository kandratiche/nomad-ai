import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/authContext";
import { router } from "expo-router";
import { useMyBookings, useMyGuideTours } from "@/hooks/useTours";

function BadgeIcon({ name, color, size, badge }: { name: any; color: string; size: number; badge: number }) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {badge > 0 && (
        <View style={badgeStyles.badge}>
          <Text style={badgeStyles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
        </View>
      )}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute", top: -4, right: -8, minWidth: 16, height: 16,
    borderRadius: 8, backgroundColor: "#FFBF00", alignItems: "center",
    justifyContent: "center", paddingHorizontal: 3,
  },
  badgeText: { color: "#0F172A", fontSize: 9, fontWeight: "800" },
});

export default function TabsLayout() {
  const { user, loading } = useContext(AuthContext);
  const { data: bookings = [] } = useMyBookings(user?.id || null);
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user]);

  if (loading || !user) {
    return null;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2DD4BF",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(255, 255, 255, 0.92)",
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.06)",
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255, 255, 255, 0.92)" }]} />
          ),
        tabBarLabelStyle: { fontWeight: "600", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips/index"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon name="calendar" color={color} size={size} badge={pendingBookings} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
