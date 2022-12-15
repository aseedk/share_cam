import * as React from 'react';
import styles from "../styles/global";
import {SafeAreaView, ScrollView, Text, View, ToastAndroid, TouchableOpacity, Image} from "react-native";
import {delay} from "../hooks/common";
import {validateEmail, validateName, validatePhone, validatePassword} from "../hooks/syntax";
import auth from "@react-native-firebase/auth";
import storage from '@react-native-firebase/storage';
import firestore from "@react-native-firebase/firestore";
import {TextInput, HelperText, Button} from "react-native-paper";
import RNSecureStore, {ACCESSIBLE} from "react-native-secure-store";
import {launchImageLibrary} from "react-native-image-picker";
import img from '../assets/default-profile-picture.webp';
const Register = ({navigation}) =>{
    const [profilePicture, setProfilePicture] = React.useState({});
    const [pictureSelected, setPictureSelected] = React.useState(false);
    const [firstName, setFirstName] = React.useState('');
    const [firstNameError, setFirstNameError] = React.useState(false);
    const [lastName, setLastName] = React.useState('');
    const [lastNameError, setLastNameError] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const [phone, setPhone] = React.useState('');
    const [phoneError, setPhoneError] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
    const [referralCode, setReferralCode] = React.useState('');
    const [eye, setEye] = React.useState(true);
    const [cEye, setCEye] = React.useState(true);

    const handleRegister = ()=>{
        if (
            firstName !== "" &&
            lastName !== "" &&
            email !== "" &&
            phone !== "" &&
            password !== "" &&
            confirmPassword !== "" &&
            !firstNameError &&
            !lastNameError &&
            !emailError &&
            !phoneError &&
            !passwordError &&
            !confirmPasswordError &&
            pictureSelected
        ){
            auth()
                .createUserWithEmailAndPassword(email, password)
                .then((user) => {
                    const reference = storage().ref(`/profile_pictures/test`);
                    reference.putFile(profilePicture.uri)
                        .then(()=>{
                            reference.getDownloadURL()
                                .then(url=>{
                                    firestore()
                                        .collection('Users')
                                        .doc(user.user.uid)
                                        .set({
                                            name: firstName + " " + lastName,
                                            email: email,
                                            phoneNumber: phone,
                                            referralCode: referralCode,
                                            profilePicture: url,
                                        })
                                        .then(async () => {
                                            ToastAndroid.show('User Registered Successfully', ToastAndroid.SHORT);
                                            const userDoc = await firestore().collection('Users').doc(user.user.uid).get();
                                            let tempUser = userDoc.data();
                                            tempUser.id = userDoc.id;
                                            RNSecureStore.set(
                                                'user',
                                                JSON.stringify(tempUser),
                                                ACCESSIBLE
                                            );
                                            navigation.replace('Homepage');
                                        });
                                })
                        })

                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        ToastAndroid.show('That email address is already in use!', ToastAndroid.SHORT);
                    }
                    if (error.code === 'auth/invalid-email') {
                        ToastAndroid.show('That email address is invalid!', ToastAndroid.SHORT);
                    }
                    if (error.code === 'auth/operation-not-allowed') {
                        ToastAndroid.show('That email address is invalid!', ToastAndroid.SHORT);
                    }
                    if (error.code === 'auth/weak-password') {
                        ToastAndroid.show('auth/weak-password', ToastAndroid.SHORT);
                    }
                    ToastAndroid.show(error);
                });
        }else {
            if (!pictureSelected) {
                ToastAndroid.show('Please select a profile picture', ToastAndroid.SHORT);
            }else {
                ToastAndroid.show("Fix Registration Form", ToastAndroid.LONG)
            }

        }

    }
    return(
        <SafeAreaView style={styles.mainView}>
            <ScrollView style={styles.bodyView}>
                <View style={{
                    marginVertical: 20,
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
                <Image source={pictureSelected ? profilePicture: img} style={{
                    width: 200,
                    height: 200,
                    alignSelf: 'center',
                    marginVertical: 20,
                    borderRadius: 100
                }}/>
                <Button
                    mode={'contained'}
                    onPress={async () => {
                        const result = await launchImageLibrary();
                        if (result.didCancel) {
                            return;
                        }else if (result.error) {
                            ToastAndroid.show(result.error, ToastAndroid.SHORT);
                            return;
                        }else {
                            setPictureSelected(true);
                            setProfilePicture(result.assets[0]);
                        }
                        setProfilePicture(result.assets[0]);
                        setPictureSelected(true);
                        console.log(result.assets[0]);
                    }}
                >
                    Choose a photo
                </Button>
                <View style={{flexDirection:'row', justifyContent:'space-evenly', width:'100%'}}>
                    <TextInput
                        label="First Name"
                        placeholder={"First Name"}
                        mode={'outlined'}
                        activeOutlineColor={'#05A3D9'}
                        value={firstName}
                        error={firstNameError}
                        style={{width:'50%'}}
                        onChangeText={async firstName => {
                            setFirstName(firstName);
                            await delay(1000);
                            if (firstName === "") {
                                setFirstNameError(false);
                            } else if (!validateName(firstName)) {
                                setFirstNameError(true);
                            } else {
                                setFirstNameError(false);
                            }
                        }}
                    />
                    <TextInput
                        label="Last Name"
                        placeholder={"Last Name"}
                        mode={'outlined'}
                        activeOutlineColor={'#05A3D9'}
                        value={lastName}
                        error={lastNameError}
                        style={{width:'50%'}}
                        onChangeText={async lastName => {
                            setLastName(lastName);
                            await delay(1000);
                            if (lastName === ""){
                                setLastNameError(false);
                            }else if (!validateName(lastName)){
                                setLastNameError(true);
                            }else {
                                setLastNameError(false);
                            }
                        }}
                    />
                </View>
                <HelperText type="error" visible={firstNameError || lastNameError}>
                    Name syntax is invalid!
                </HelperText>
                <TextInput
                    label="Email Address"
                    placeholder={"Enter Your Email Address"}
                    mode={'outlined'}
                    activeOutlineColor={'#05A3D9'}
                    value={email}
                    error={emailError}
                    onChangeText={async email => {
                        setEmail(email);
                        await delay(1000);
                        if (email === ""){
                            setEmailError(false);
                        }else if(!validateEmail(email)){
                            setEmailError(true);
                        }else {
                            setEmailError(false)
                        }
                    }}
                />
                <HelperText type="error" visible={emailError}>
                    Email Address is invalid
                </HelperText>
                <TextInput
                    label="Phone Number"
                    placeholder={"Enter Your Phone Number"}
                    mode={'outlined'}
                    activeOutlineColor={'#05A3D9'}
                    value={phone}
                    error={phoneError}
                    onChangeText={async phone => {
                        setPhone(phone);
                        await delay(1000);
                        if (phone === ""){
                            setPhoneError(false);
                        }else if(!validatePhone(phone)){
                            setPhoneError(true);
                        }else {
                            setPhoneError(false);
                        }
                    }}
                />
                <HelperText type="error" visible={phoneError}>
                    Phone Number is invalid
                </HelperText>
                <TextInput
                    label={"Password"}
                    placeholder={"Enter Your Password"}
                    mode={"outlined"}
                    activeOutlineColor={'#05A3D9'}
                    value={password}
                    error={passwordError}
                    onChangeText={async password => {
                        setPassword(password);
                        await delay(1000);
                        if (password === ''){
                            setPasswordError(false);
                        }else if(!validatePassword(password)){
                            setPasswordError(true);
                        }else {
                            setPasswordError(false);
                        }
                    }}
                    secureTextEntry={eye}
                    right={<TextInput.Icon name="eye"  onPress={()=>{setEye(!eye)}}/>}
                />
                <HelperText type="error" visible={passwordError}>
                    Password must contain at least 8 letters and 1 digit!
                </HelperText>
                <TextInput
                    label={"Confirm Password"}
                    placeholder={"Enter Your Password Again"}
                    mode={"outlined"}
                    activeOutlineColor={'#05A3D9'}
                    value={confirmPassword}
                    error={confirmPasswordError}
                    onChangeText={async confirmPassword => {
                        setConfirmPassword(confirmPassword);
                        await delay(1000);
                        if (confirmPassword === ""){
                            setConfirmPasswordError(false);
                        }else if(confirmPassword !== password){
                            setConfirmPasswordError(true);
                        }else {
                            setConfirmPasswordError(false);
                        }
                    }}
                    secureTextEntry={cEye}
                    right={<TextInput.Icon name="eye"  onPress={()=>{setCEye(!cEye)}}/>}
                />
                <HelperText type="error" visible={confirmPasswordError}>
                    Password mismatch
                </HelperText>
                <TextInput
                    label="Referral Code"
                    placeholder={"Enter Referral Code"}
                    mode={'outlined'}
                    activeOutlineColor={'#05A3D9'}
                    value={referralCode}
                    onChangeText={referralCode => setReferralCode(referralCode)}
                />
                <HelperText type="error" visible={false}>
                    Referral Code is invalid
                </HelperText>
                <Button
                    mode={'contained'}
                    onPress={handleRegister}
                    >
                    Register
                </Button>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginVertical:40,
                    justifyContent:'center',
                }} onPress={()=> navigation.navigate('Login')}>
                    <Text>Already have an account? </Text>
                    <Text style={{color: '#05A3D9'}}>Sign In</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Register;
