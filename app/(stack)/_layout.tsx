import { Stack } from "expo-router";
import React from "react";

import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {

  return (
  <GestureHandlerRootView style={{flex: 1}}>
    <StatusBar style="light"  />
    <Stack screenOptions={{ headerShown: false }} />
  </GestureHandlerRootView>
  )
}
