import 'react-native-gesture-handler';
import * as React from 'react';
import {DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import {LogBox} from "react-native";
import Main from "./src/Main";
import {decode, encode} from 'base-64'

LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
]);
if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#05A3D9',
        accent: 'yellow',
    },
};
export default function App() {
    return (
        <PaperProvider theme={theme}>
            <Main />
        </PaperProvider>
    );
}
