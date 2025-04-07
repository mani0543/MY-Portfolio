import { AppRegistry } from 'react-native';
import AppWrapper from './AppWrapper'; // Import AppWrapper
import { name as appName } from './app.json';

// Register the AppWrapper component as the root component
AppRegistry.registerComponent(appName, () => AppWrapper);