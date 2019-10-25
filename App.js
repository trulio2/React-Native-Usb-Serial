import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import UsbSerial from './screens/UsbSerial';
import UsbSerialManual from './screens/UsbSerialManual';

const navigator = createStackNavigator(
  {
    Home: HomeScreen,
    UsbAuto: UsbSerial,
    UsbManual: UsbSerialManual
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      title: 'Usb Serial'
    }
  }
);
export default createAppContainer(navigator);