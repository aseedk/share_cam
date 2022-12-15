import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

function Share_Ride_Scan_QR ({route, navigation}){
    const onSuccess = e => {
        console.log(e.data);
        navigation.navigate('Share Ride Select Network', {
            link: e.data,
        })
    };

    return (
        <QRCodeScanner
            onRead={onSuccess}
            topContent={
                <Text style={styles.centerText}>
                    <Text style={styles.textBold}>Scan Qr Code {"\n"}</Text>
                    <Text>And share your journey with your friends</Text>

                </Text>
            }
            bottomContent={
                <TouchableOpacity style={styles.buttonTouchable}>
                    <Text style={styles.buttonText}>ShareCam.</Text>
                </TouchableOpacity>
            }
        />
    );
}

const styles = StyleSheet.create({
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777'
    },
    textBold: {
        fontWeight: '500',
        color: '#000'
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
        padding: 16
    }
});

export default Share_Ride_Scan_QR;
