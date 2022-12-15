import * as React from 'react';
import styles from "../../styles/global";
import {SafeAreaView, ScrollView, Text, View, ToastAndroid, TouchableOpacity, Image, StyleSheet} from "react-native";
import {Avatar, Button, Card, Paragraph, TextInput} from "react-native-paper";

const Share_Homepage = ({navigation}) =>{
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
                <SafeAreaView>
                    <ScrollView style={{
                        backgroundColor: '#05A3D9',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        marginVertical: 20,
                        borderRadius: 10,
                    }}>
                        <TouchableOpacity style={pageStyles.card}
                                          onPress={()=> navigation.navigate('Share Individual Select Network')}
                        >
                            <Card>
                                <Card.Title
                                    left={(props) =>
                                        <Avatar.Icon {...props}
                                                     color={'#05A3D9'}
                                                     size={75}
                                                     style={pageStyles.cardBackground}
                                                     icon="share" />}
                                />
                                <Card.Content>
                                    <Text style={pageStyles.cardContentText}>Share as an Individual</Text>
                                    <Paragraph style={pageStyles.cardContentParagraph}>
                                        Share your travel location and footage with your friends and family
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                        <TouchableOpacity style={pageStyles.card}
                                          onPress={()=> navigation.navigate('Share Ride Scan QR')}
                        >
                            <Card>
                                <Card.Title
                                    left={(props) =>
                                        <Avatar.Icon {...props}
                                                     color={'#05A3D9'}
                                                     size={75}
                                                     style={pageStyles.cardBackground}
                                                     icon="taxi" />}
                                />
                                <Card.Content>
                                    <Text style={pageStyles.cardContentText}>Share your ride</Text>
                                    <Paragraph style={pageStyles.cardContentParagraph}>
                                        Share your ride with your friends and family
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                        <TouchableOpacity style={pageStyles.card}
                                          onPress={()=> navigation.navigate('Share Stream List')}
                        >
                            <Card>
                                <Card.Title
                                    left={(props) =>
                                        <Avatar.Icon {...props}
                                                     color={'#05A3D9'}
                                                     size={75}
                                                     style={pageStyles.cardBackground}
                                                     icon="camera-marker" />}
                                />
                                <Card.Content>
                                    <Text style={pageStyles.cardContentText}>Streams of friends and family</Text>
                                    <Paragraph style={pageStyles.cardContentParagraph}>
                                        See live streams of your friends and family
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
                                                     icon="history" />}
                                />
                                <Card.Content>
                                    <Text style={pageStyles.cardContentText}>Streams History</Text>
                                    <Paragraph style={pageStyles.cardContentParagraph}>
                                        See details of your previous streams
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
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

export default Share_Homepage;
