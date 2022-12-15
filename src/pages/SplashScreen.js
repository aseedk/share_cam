import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import firestore from "@react-native-firebase/firestore";
import RNSecureStore, {ACCESSIBLE} from "react-native-secure-store";
import {getCircularReplacer} from "../hooks/common";
import auth from "@react-native-firebase/auth";

export default function SplashScreen({navigation}) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    React.useEffect(()=>{
        async function  splash(){
            await delay(2000);
            if (auth().currentUser) {
                await firestore().collection('Users')
                    .doc(auth().currentUser.uid)
                    .get()
                    .then((doc) => {
                        let tempUser = doc.data();
                        tempUser.id = doc.id;
                        RNSecureStore.set(
                            'user',
                            JSON.stringify(tempUser, getCircularReplacer()),
                            ACCESSIBLE
                        );
                        navigation.reset({
                            index: 0,
                            routes: [{name: 'Homepage'}],
                        });
                    })
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                });
            }
        }
        splash().then(() => console.log("App loaded"));
    }, []);
    return(
        <View style={{justifyContent: 'center',flexDirection:'row', alignItems:'center', backgroundColor: '#05A3D9', height:'100%', width:'100%'}}>
            <Text style={styles.logoTextFirst}>Share</Text>
            <Text style={styles.logoTextSecond}>Cam.</Text>
        </View>
    )
}
const styles= StyleSheet.create({
    logoTextFirst:{
        fontSize: 60,
        fontWeight: '800',
        fontStyle:'normal',
        fontFamily:'Roboto',
        color:'#fff'
    },
    logoTextSecond:{
        fontSize: 60,
        fontWeight: '200',
        fontStyle:'italic',
        fontFamily:'Roboto',
        color:'#fff'
    },
})
