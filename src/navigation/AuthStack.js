import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#8A2BE2' },
                headerTintColor: '#fff',
                headerShown: false,
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    title: 'Login',
                    headerBackVisible: false,
                }}
            />
            <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{
                    title: 'Sign Up',
                    headerBackVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}
