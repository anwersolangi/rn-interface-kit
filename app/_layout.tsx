import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();

export default function StackLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
