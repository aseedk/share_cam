import * as React from 'react';
import styles from "../styles/global";
import {SafeAreaView, ScrollView, Text, View, ToastAndroid, TouchableOpacity} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import {TextInput, HelperText, Button} from "react-native-paper";
import RNSecureStore, {ACCESSIBLE} from "react-native-secure-store";
import {getCircularReplacer} from "../hooks/common";

const Login = ({navigation}) => {
    const [email, setEmail] = React.useState('aseedk1999@hotmail.con');
    const [emailError, setEmailError] = React.useState(false);
    const [password, setPassword] = React.useState('test1234');
    const [passwordError, setPasswordError] = React.useState(false);
    const [eye, setEye] = React.useState(true);
    const handleLogin = () => {
        if (
            email !== "" && password !== "" &&
            !emailError && !passwordError
        ){
            auth().signInWithEmailAndPassword(email, password)
                .then((user) => {
                    firestore().collection('Users').doc(user.user.uid).get()
                        .then((userDoc)=>{
                            let tempUser = userDoc.data();
                            tempUser.id = userDoc.id;
                            RNSecureStore.set(
                                'user',
                                JSON.stringify(tempUser, getCircularReplacer()),
                                ACCESSIBLE
                            );
                            navigation.replace('Homepage')
                            ToastAndroid.show('User account signed in!', ToastAndroid.SHORT);
                        });
                })
                .catch(function(error) {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if (errorCode === 'auth/wrong-password') {
                        ToastAndroid.show('Incorrect password', ToastAndroid.LONG);
                    } else if(errorCode === 'auth/user-not-found') {
                        ToastAndroid.show('User account doesnt exists', ToastAndroid.LONG);
                    } else if (errorCode === 'auth/invalid-email') {
                        ToastAndroid.show('That email address is invalid!', ToastAndroid.LONG);
                    } else if (errorCode === 'auth/user-disabled') {
                        ToastAndroid.show('That user account is disabled', ToastAndroid.LONG);
                    }
                    else {
                        alert(errorMessage);
                    }
                    console.log(error);
                });
        } else {
            ToastAndroid.show('Check login fields', ToastAndroid.SHORT);
        }
    }

  return (
    <SafeAreaView style={styles.mainView}>
        <ScrollView style={styles.bodyView}>
            <View style={{
                marginVertical: 40,
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <Text style={{
                    fontSize: 60,
                    fontWeight: '800',
                    fontStyle:'normal',
                    fontFamily:'Roboto',
                    color:'#05A3D9'
                }}>
                    Share
                </Text>
                <Text style={{
                    fontSize: 60,
                    fontWeight: '200',
                    fontStyle:'italic',
                    fontFamily:'Roboto',
                    color:'#05A3D9'
                }}>
                    Cam.
                </Text>
            </View>
            <TextInput
                label="Email or Phone Number"
                placeholder={"Enter Your Email or Phone Number"}
                mode={'outlined'}
                activeOutlineColor={'#05A3D9'}
                value={email}
                error={emailError}
                onChangeText={email => setEmail(email)}
            />
            <HelperText type="error" visible={emailError}>
                Email address is invalid!
            </HelperText>
            <TextInput
                label={"Password"}
                placeholder={"Enter Your Password"}
                mode={"outlined"}
                activeOutlineColor={'#05A3D9'}
                value={password}
                onChangeText={password => setPassword(password)}
                secureTextEntry={eye}
                error={passwordError}
                right={<TextInput.Icon name="eye"  onPress={()=>{setEye(!eye)}}/>}
            />
            <HelperText type="error" visible={passwordError}>
                Password Syntax is invalid
            </HelperText>
            <Text style={{
                textAlign: 'right',
                fontWeight:'bold',
                marginBottom:20,
                color:'#05A3D9'}}
            onPress={()=>{navigation.navigate('Forget Password')}}
            >
                Forgot Password?
            </Text>
            <Button
                mode="contained"
                onPress={() => {
                    handleLogin();
                }} >
                Login
            </Button>
            <TouchableOpacity style={{
                flexDirection:'row',
                marginVertical:40,
                justifyContent:'center'
            }} onPress={()=> navigation.navigate('Register')}>
                <Text>Dont have an account? </Text>
                <Text style={{color: '#05A3D9'}}>Sign Up</Text>
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
};
export default Login;
