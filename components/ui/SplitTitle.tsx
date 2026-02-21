import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface SplitTitleProps {
  first: string;
  second: string;
  style?: ViewStyle;
  textStyle?: object;
}

export function SplitTitle({ first, second, style, textStyle }: SplitTitleProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.first, textStyle]}>{first}</Text>
      <Text style={[styles.second, textStyle]}>{second}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  first: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  second: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#2DD4BF",
    letterSpacing: 0.5,
  },
});
