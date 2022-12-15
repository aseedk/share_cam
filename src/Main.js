import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forget_Password from "./pages/Forget_Password";
import Homepage from "./pages/Homepage";
import Network_Homepage from "./pages/Network/Network_Homepage";
import Add_Contacts from "./pages/Network/Add_Contacts";
import Share_Homepage from "./pages/Share/Share_Homepage";
import Share_Individual_Select_Network from "./pages/Share/Share_Individual_Select_Network";
import {PermissionsAndroid, ToastAndroid} from "react-native";
import Share_Individual_Share_Live from "./pages/Share/Share_Individual_Share_Live";
import Share_Ride_Scan_QR from "./pages/Share/Share_Ride_Scan_QR";
import Share_Ride_Select_Network from "./pages/Share/Share_Ride_Select_Network";
import Share_Ride_Share_Live from "./pages/Share/Share_Ride_Live_Stream";
import Share_Stream_List from "./pages/Share/Share_Stream_List";
import Share_Stream from "./pages/Share/Share_Stream";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import RNSecureStore, {ACCESSIBLE} from "react-native-secure-store";
import {getCircularReplacer} from "./hooks/common";
import SplashScreen from "./pages/SplashScreen";

const Stack = createStackNavigator();
const Main = () => {
    React.useEffect(()=>{
        const requestPermissions = async () =>{
            try {
                const granted = PermissionsAndroid.requestMultiple(
                    [
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        PermissionsAndroid.PERMISSIONS.CAMERA,
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
                    {
                        title: "Location, Video and Audio Permissions",
                        message:
                            "Share cam need access to this permission" +
                            "So that you can share your streams/rides with your friends",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("All Permissions Granted");
                } else {
                    console.log("Permissions Denied");
                }
            }catch (error) {
                console.log(error);
            }
        }
        requestPermissions()
            .then(()=>{console.log("Permissions Requested")})
            .catch(()=>{console.log("Permissions Error")})
    })
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name={'Splash'} component={SplashScreen}/>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name={'Register'} component={Register} />
            <Stack.Screen name={'Forget Password'} component={Forget_Password} />
            <Stack.Screen name={'Homepage'} component={Homepage} />
            <Stack.Screen name={'Network Homepage'} component={Network_Homepage} />
            <Stack.Screen name={'Network Add Contact'} component={Add_Contacts} />
            <Stack.Screen name={'Share Homepage'} component={Share_Homepage} />
            <Stack.Screen name={'Share Individual Select Network'} component={Share_Individual_Select_Network} />
            <Stack.Screen name={'Share Individual Live Stream'} component={Share_Individual_Share_Live} />
            <Stack.Screen name={'Share Ride Scan QR'} component={Share_Ride_Scan_QR} />
            <Stack.Screen name={'Share Ride Select Network'} component={Share_Ride_Select_Network} />
            <Stack.Screen name={'Share Ride Live Stream'} component={Share_Ride_Share_Live} />
            <Stack.Screen name={'Share Stream List'} component={Share_Stream_List} />
            <Stack.Screen name={'Share Stream'} component={Share_Stream} />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default Main;
