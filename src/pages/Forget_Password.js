import * as React from 'react';
import styles from "../styles/global";
import {SafeAreaView, ScrollView, Text, ToastAndroid, View} from "react-native";
import {Button, Headline, HelperText, Paragraph, TextInput} from "react-native-paper";
import {delay} from "../hooks/common";
import {validateEmail} from "../hooks/syntax";
import auth from "@react-native-firebase/auth";

const Forget_Password = ({navigation}) => {
    const [email, setEmail] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const onChangeEmail = async (email) => {
        setEmail(email);
        await delay(1000);
        if (email === "") {
            setEmailError(false);
        } else if (!validateEmail(email)) {
            setEmailError(true);
        } else {
            setEmailError(false);
        }
    }
    const handlePasswordResetLink = () => {
        if (emailError) {
            ToastAndroid.show("Email address is invalid!", ToastAndroid.SHORT);
        }
        else {
            auth().fetchSignInMethodsForEmail(email)
                .then((signInMethods) => {
                    if (signInMethods.length) {
                        auth().sendPasswordResetEmail(email)
                            .then(() => {
                                ToastAndroid.show("Password reset email sent!", ToastAndroid.SHORT);
                                navigation.navigate("Login");
                            })
                            .catch((error) => {
                                ToastAndroid.show(error.message, ToastAndroid.SHORT);
                            });
                    } else {
                        ToastAndroid.show("Email address does not exist!", ToastAndroid.SHORT);
                    }
                })
                .catch((error) => {
                    ToastAndroid.show(error.message, ToastAndroid.SHORT);
                });
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
                <Headline style={{textAlign: 'center', fontWeight: 'bold', marginVertical: 20}}>
                    Forget Password?
                </Headline>
                <Paragraph style={{marginVertical: 20}}>
                    Enter your email address below and we will send you a link to reset your password.
                </Paragraph>
                <TextInput
                    label="Email"
                    placeholder={"Enter your Email"}
                    mode={'outlined'}
                    value={email}
                    error={emailError}
                    onChangeText={onChangeEmail}
                />
                <HelperText type="error" visible={emailError}>
                    Email address is invalid!
                </HelperText>
                <Button mode="contained" onPress={handlePasswordResetLink}>
                    Send Password Reset Link
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};
export default Forget_Password;
