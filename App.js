import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './src/navigation/AuthStack';
import MainTab from './src/navigation/MainTabs';

const Root = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Root.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}>

        {/* AuthStack holds Login & Signup */}
        <Root.Screen name="Auth" component={AuthStack} />

        {/* MainTabs is the bottom-tab flow */}
        {/* <Root.Screen name="MainTab" component={MainTab} /> */}
      </Root.Navigator>
    </NavigationContainer>
  );
}