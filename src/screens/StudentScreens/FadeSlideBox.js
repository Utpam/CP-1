import React from 'react';
import {Text} from 'react-native';
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated';

export default function FadeSlideBox() {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(250)}
      layout={Layout.springify()} // animates position/size changes
      style={{ padding: 12, margin: 70, backgroundColor: '#fff', borderRadius: 8, elevation: 1 }}
    >
      <Text>ASs</Text>
    </Animated.View>
  );
}