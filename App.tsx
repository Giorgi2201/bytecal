import { useCallback } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CalorieProvider } from './src/store/CalorieContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { RootTabParamList } from './src/navigation/types';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FloatingTabBar } from './src/components/FloatingTabBar';

const Tab = createBottomTabNavigator<RootTabParamList>();

function AppNavigator() {
  const { theme } = useAppTheme();
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => <FloatingTabBar {...props} />,
    [],
  );

  return (
    <>
      <StatusBar barStyle={theme.blurType === 'dark' ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          tabBar={renderTabBar}
          screenOptions={() => ({
            animation: 'shift',
            headerShown: false,
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Scan" component={ScanScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CalorieProvider>
          <AppNavigator />
        </CalorieProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
