import * as React from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View, StyleSheet, Image} from "react-native";

import styles from "../../styles/global";
import {firebase} from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {NodePlayerView} from "react-native-nodemediaclient";
import img from "../../assets/default-profile-picture.webp";

const database = firebase.app().database("https://sharecam-70d17-default-rtdb.europe-west1.firebasedatabase.app/");
const Share_Stream_List = ({navigation}) =>{
    const [streams, setStreams] = React.useState([]);
    React.useEffect(()=>{
        const fetchStreams = async (tempStreams) =>{
            let activeStreams = [];
            for (const tempStream of tempStreams) {
                if (tempStream.status === 'active') {
                    await database.ref('Streams/' + tempStream.streamID)
                        .once('value', async (snapshot) => {
                            await firestore().collection('Users')
                                .doc(snapshot.val().streamer)
                                .get()
                                .then((doc) => {
                                    let dateTime = new Date(snapshot.val().timestamp);
                                    let date = dateTime.getDate() + '/' + (dateTime.getMonth() + 1) + '/' + dateTime.getFullYear();
                                    let time = dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds();
                                    let data = {
                                        stream: snapshot.val(),
                                        id: snapshot.key,
                                        sender: doc.data(),
                                        date: date,
                                        time: time
                                    };


                                    activeStreams.push(data);
                                    console.log(activeStreams.length);
                                    setStreams([...streams, data]);
                                });
                        });
                }
            }
            console.log("Active Streams: " + activeStreams.length);
            return activeStreams;
        }
        firestore()
            .collection('Streams')
            .doc(auth().currentUser.uid)
            .get()
            .then(async (doc) => {
                if (doc.exists) {
                    let tempStreams = doc.data().sharedStreams;
                    fetchStreams(tempStreams).then((activeStreams)=>{
                        console.log("Active Streams: " + activeStreams.length);
                        //setStreams(activeStreams);
                    });
                }
            })
        return ()=>{
            setStreams([]);
        }
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
                <ScrollView>
                    {streams.map((stream, index) => (

                        <TouchableOpacity key={index} style={{
                            height: 150,
                            backgroundColor:'#05A3D9',
                            flexDirection:'row',
                            marginVertical:10,
                            borderRadius:25}}
                          onPress={()=>{
                              setStreams([]);
                              navigation.navigate('Share Stream', {link: stream.id})
                          }}
                        >
                            <View style={{width:'30%', alignItems:'center', paddingHorizontal:2}}>
                                <Image
                                    source={stream.sender.profilePicture ? {uri: stream.sender.profilePicture}: img}
                                    style={{
                                        width: 75,
                                        height: 75,
                                        borderRadius: 50,
                                        backgroundColor: "red",
                                        resizeMode: "cover",
                                        borderColor: "#05A3D9",
                                        borderWidth: 3,
                                    }}
                                />
                                <Text style={{fontWeight:'bold'}}>{stream.sender.name}</Text>
                                <Text>{stream.date}</Text>
                                <Text style={{color:'red'}}>{stream.time}</Text>
                            </View>
                            <View style={{width:'70%', marginVertical:5, borderRadius:10}}>
                                <NodePlayerView
                                    style={pageStyles.nodeCameraView}
                                    inputUrl={"https://stream.mux.com/" + stream.stream.playbacks.id + ".m3u8"}
                                    scaleMode={"ScaleAspectFit"}
                                    bufferTime={300}
                                    maxBufferTime={1000}
                                    autoplay={true}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    )
}
const pageStyles = StyleSheet.create({
    nodeCameraView: {
        height:'100%',
        borderRadius:10,
        borderWidth:1,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
})
export default Share_Stream_List;
