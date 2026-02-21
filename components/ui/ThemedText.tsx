import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

const fontFamily = {
  display: "Montserrat_700Bold",
  heading: "Montserrat_600SemiBold",
  body: "Inter_400Regular",
  caption: "Inter_400Regular",
  link: "Inter_500Medium",
  error: "Inter_600SemiBold",
};

export function DisplayText({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.display, style]} {...props}>
      {children}
    </Text>
  );
}

export function HeadingText({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.heading, style]} {...props}>
      {children}
    </Text>
  );
}

export function BodyText({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.body, style]} {...props}>
      {children}
    </Text>
  );
}

export function CaptionText({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.caption, style]} {...props}>
      {children}
    </Text>
  );
}

export function LinkText({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.link, style]} {...props}>
      {children}
    </Text>
  );
}

export function ErrorText({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.error, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: fontFamily.display,
    fontSize: 30,
    lineHeight: 36,
    color: "#F8FAFC",
  },
  heading: {
    fontFamily: fontFamily.heading,
    fontSize: 20,
    lineHeight: 28,
    color: "#F8FAFC",
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    color: "#E2E8F0",
  },
  caption: {
    fontFamily: fontFamily.caption,
    fontSize: 14,
    lineHeight: 20,
    color: "#94A3B8",
  },
  link: {
    fontFamily: fontFamily.link,
    fontSize: 16,
    lineHeight: 24,
    color: "#2DD4BF",
  },
  error: {
    fontFamily: fontFamily.error,
    fontSize: 14,
    lineHeight: 20,
    color: "#EF4444",
  },
});
