import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
declare const jest: any;

if (typeof jest !== 'undefined') {
  jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
  });

  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
}