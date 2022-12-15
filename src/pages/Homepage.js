import * as React from 'react';
import styles from "../styles/global";
import {SafeAreaView, ScrollView, Text, View, StyleSheet,  TouchableOpacity, Image} from "react-native";
import RNSecureStore, {ACCESSIBLE} from "react-native-secure-store";
import {Card, Avatar, Paragraph, Button} from "react-native-paper";
import img from "../assets/default-profile-picture.webp";
import auth from "@react-native-firebase/auth";
import {getCircularReplacer} from "../hooks/common";

const Homepage = ({navigation}) =>{
    const [user, setUser] = React.useState({});
    React.useEffect(() => {
        RNSecureStore.get('user').then(value => {
            if (value) {
                setUser(JSON.parse(value));
            }
        });
    }, []);

    return(
        <SafeAreaView style={styles.mainView}>
            <ScrollView style={styles.bodyView}>
                <View style={{
                    marginVertical: 10,
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
                <View style={pageStyles.profileDisplay}>
                    <Image
                        source={user.profilePicture? {uri: user.profilePicture}: img}
                        style={pageStyles.profileImage}
                    />
                    <View>
                        <Text style={{
                            fontWeight:'bold',
                            fontSize: 20,
                            color: '#fff',
                        }}>
                            Welcome!
                        </Text>
                        <Text style={{
                            fontWeight:'bold',
                            fontSize: 20,
                            color: '#fff',
                        }}>
                            {user.name}
                        </Text>
                    </View>
                </View>
                <SafeAreaView>
                    <ScrollView style={{
                        backgroundColor: '#05A3D9',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        marginVertical: 20,
                        borderRadius: 10,
                    }}>
                        <TouchableOpacity style={pageStyles.card}
                                          onPress={()=> navigation.navigate('Share Homepage')}
                        >
                            <Card>
                                <Card.Title
                                    left={(props) =>
                                        <Avatar.Icon {...props}
                                                     color={'#05A3D9'}
                                                     size={75}
                                                     style={pageStyles.cardBackground}
                                                     icon="video-outline" />}
                                />
                                <Card.Content>
                                    <Text style={pageStyles.cardContentText}>Share Camera Now</Text>
                                    <Paragraph style={pageStyles.cardContentParagraph}>
                                        Share your camera and location with your friends and family and be safe.
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                        <TouchableOpacity style={pageStyles.card}
                                          onPress={()=> navigation.navigate('Network Homepage')}
                        >
                            <Card>
                                <Card.Title
                                    left={(props) =>
                                        <Avatar.Icon {...props}
                                                     color={'#05A3D9'}
                                                     size={75}
                                                     style={pageStyles.cardBackground}
                                                     icon="wan" />}
                                />
                                <Card.Content>
                                    <Text style={pageStyles.cardContentText}>Network</Text>
                                    <Paragraph style={pageStyles.cardContentParagraph}>
                                        Connect with your friends and family and be safe.
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
                <Button mode={'contained'} style={{borderRadius:25, marginBottom: 20}} onPress={()=>{
                    auth().signOut().then(r => {
                        navigation.navigate('Login')
                        RNSecureStore.set(
                            'user',
                            '',
                            ACCESSIBLE
                        );
                    });
                }}>
                    <Text style={{
                        fontWeight:'bold',
                        fontSize: 20,
                        color: '#fff',
                        marginVertical: 20,
                        marginHorizontal: 20,
                    }}>
                        Logout
                    </Text>
                </Button>
            </ScrollView>
        </SafeAreaView>
    )
}
const pageStyles= StyleSheet.create({
    profileDisplay:{
        flexDirection:'row',
        padding:10,
        alignItems:'center',
        backgroundColor:'#05A3D9',
        borderRadius: 25
    },
    profileImage: {
        width: 75,
        height: 75,
        borderRadius: 75/ 2,
        margin:10
    },
    card: {
        marginVertical: 10,
    },
    cardBackground: {
        backgroundColor: "#FFF"
    },
    cardContentText: {
        fontStyle:'normal',
        fontWeight:'800',
        fontFamily:'Roboto'
    },
    cardContentParagraph: {
        fontWeight: "800",
        fontStyle:'normal',
        fontFamily:'Open Sans',
        color:'rgba(0, 0, 0, 0.5)',
        opacity:0.7
    },
    color:{color:'#05A3D9'}

})
export default Homepage;
