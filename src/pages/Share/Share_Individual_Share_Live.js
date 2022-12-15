import * as React from 'react';
import styles from "../../styles/global";
import {
    SafeAreaView,
    ScrollView,
    TextInput,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    PermissionsAndroid, ToastAndroid, Alert
} from "react-native";
import {Avatar, Button} from "react-native-paper";
import Geolocation from '@react-native-community/geolocation';
import MapboxGL, {Logger} from "@react-native-mapbox-gl/maps";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {firebase} from "@react-native-firebase/database";
import {NodeCameraView} from "react-native-nodemediaclient";
import img from "../../assets/default-profile-picture.webp";
import RNSecureStore from "react-native-secure-store";
import QRCode from 'react-native-qrcode-svg';
import axios from "axios";
import {GiftedChat, InputToolbar} from "react-native-gifted-chat";

MapboxGL.setAccessToken('pk.eyJ1IjoiYXNlZWRrIiwiYSI6ImNremF6MTN4YTA4NTEydW50cmxnYmRodnIifQ.CZl7Mza55vy7J8tYdy4eyg');
Logger.setLogCallback(log => {
    const { message } = log;
    return !!(message.match('Request failed due to a permanent error: Canceled') ||
        message.match('Request failed due to a permanent error: Socket Closed'));

});


const MUX_TOKEN_ID = "a798af76-e85a-4357-b2fc-c96d6c5531af"
const MUX_TOKEN_SECRET = "s7BP7+tk0Hr2Yl1rNjYojOd/MVtyI1EsVGXNT31nvCDzF/PpjaePiVqAPRe76zC/aoj1ghl//dH";
const database = firebase.app().database("https://sharecam-70d17-default-rtdb.europe-west1.firebasedatabase.app/");

let watchID;

const Share_Individual_Share_Live = ({navigation, route}) =>{
    const contacts = route?.params?.contacts;
    const [coordinates, setCoordinates] = React.useState([0, 0]);
    const [streamKey, setStreamKey] = React.useState('');
    const [liveId, setLiveId] = React.useState('qr');
    const [message, setMessage] = React.useState('');
    const [showQR, setShowQR] = React.useState(false);
    const [showChat, setShowChat] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    const messageInput = React.useRef(null);
    const [shareCheck, setShareCheck] = React.useState(false);

    const [user, setUser] = React.useState({});
    const vb = React.useRef(null);

    const handleStream = async ()=>{
        if (!shareCheck){
            const mux_instance = await axios.create({
                baseURL: 'https://api.mux.com',
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                auth: {
                    username: MUX_TOKEN_ID,
                    password: MUX_TOKEN_SECRET
                }
            });
            const mux_response = await mux_instance.post("/video/v1/live-streams", {
                "playback_policy": ["public"],
                "new_asset_settings": {
                    "playback_policy": ["public"]
                },
                "latency_mode": "low",
            });
            setStreamKey(mux_response.data.data.stream_key);
            setStreamKey( streamKey + mux_response.data.data.stream_key);
            const streamReference = database.ref('/Streams').push();
            streamReference.set({
                streamer: auth().currentUser.uid,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                startCoordinates: coordinates,
                playbacks: mux_response.data.data.playback_ids[0],
            });
            firestore().collection('Streams')
                .doc(auth().currentUser.uid)
                .update({
                    myStreams: firestore.FieldValue.arrayUnion({streamID: streamReference.key, timestamp: firestore.Timestamp.now(), status: 'active'})
                }).then(() => {
                setLiveId(streamReference.key);
                console.log("Live added!");
                setShareCheck(true);
                vb.current.start();
            }).catch(error => {
                if (error.code === 'firestore/not-found') {
                    firestore().collection('Streams')
                        .doc(auth().currentUser.uid)
                        .set({
                            myStreams: [{streamID: streamReference.key, timestamp:firestore.Timestamp.now(), status: 'active'}]
                        }).then(() => {
                        setLiveId(streamReference.key);
                        console.log("Live added!");
                        setShareCheck(true);
                        vb.current.start();
                    })
                }
            });
            if (contacts){
                for (let contact of contacts){
                    firestore().collection('Streams')
                        .doc(contact.id)
                        .update({
                            sharedStreams: firestore.FieldValue.arrayUnion({streamID: streamReference.key, timestamp: firestore.Timestamp.now(), status: 'active'})
                        }).then(() => {
                        console.log('Stream added!');
                    }).catch(error => {
                        if (error.code === 'firestore/not-found') {
                            firestore().collection('Streams')
                                .doc(contact.id)
                                .set({
                                    sharedStreams: [{streamID: streamReference.key, timestamp: firestore.Timestamp.now(), status: 'active'}]
                                }).then(() => {
                                console.log('Stream added!');
                            })
                        }
                    });
                }
            }
        }
        else {
            vb.current.stop();
            firestore().collection('Streams')
                .doc(auth().currentUser.uid)
                .get()
                .then(doc => {
                    let myStreams = doc.data().myStreams;
                    myStreams[myStreams.length - 1].status = 'inactive';
                    firestore().collection('Streams')
                        .doc(auth().currentUser.uid)
                        .update({
                            myStreams: myStreams
                        }).then(() => {
                        console.log('Stream Inactive!');
                    }).catch(error => {
                        console.log(error);
                    });
                    for(let contact of contacts){
                        firestore().collection('Streams')
                            .doc(contact.id)
                            .get()
                            .then(doc => {
                                let sharedStreams = doc.data().sharedStreams;
                                for (let i = 0; i < sharedStreams.length; i++){
                                    if (sharedStreams[i].streamID === liveId){
                                        sharedStreams[i].status = 'inactive';
                                        break;
                                    }
                                }
                                firestore().collection('Streams')
                                    .doc(contact.id)
                                    .update({
                                        sharedStreams: sharedStreams
                                    }).then(() => {
                                    console.log('Stream Inactive!');
                                }).catch(error => {
                                    console.log(error);
                                });
                            })
                    }
            });
            navigation.replace('Homepage');
            ToastAndroid.show('Thank you for streaming. Stay Safe!', ToastAndroid.SHORT);
            setShareCheck(false);
        }
    }
    React.useEffect(() => {
        RNSecureStore.get('user').then(value => {
            if (value) {
                setUser(JSON.parse(value));
            }
        });
    }, []);
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
    }, [])
    React.useEffect(()=>{
        const getLiveLocation = () => {
            watchID = Geolocation.watchPosition(
                (position) => {
                    console.log(position);
                    const currentLongitude =
                        JSON.stringify(position.coords.longitude);
                    const currentLatitude =
                        JSON.stringify(position.coords.latitude);
                    setCoordinates([parseFloat(currentLongitude), parseFloat(currentLatitude)])
                    if (shareCheck) {
                        database.ref('Streams/' + liveId + '/historyCoordinates').push({
                            coordinates,
                        })
                    }
                },
                (error) => {
                    console.log(error.message);
                },
                {
                    enableHighAccuracy: false,
                    maximumAge: 1000,
                    distanceFilter: 5
                },
            );
        };
        getLiveLocation();
        return () => {
            Geolocation.clearWatch(watchID);
        };
    })
    React.useEffect(() => {
        database
            .ref('Streams/' + liveId + "/messages")
            .on('child_added', snapshot => {
                console.log('A new node has been added', snapshot.val());
                onSend([{
                    _id: snapshot.key,
                    text: snapshot.val().message,
                    createdAt: new Date(snapshot.val().time),
                    user: {
                        _id: snapshot.val().userId,
                        name: snapshot.val().userName,
                    },
                }]);
                //setMessages(messages => GiftedChat.append(...messages, ));
            });
        return () => {
            database.ref(liveId).off();
        };
    }, [liveId]);
    const onSend = React.useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, [])
    return(
        <SafeAreaView style={[styles.mainView]}>
            <View style={[styles.bodyView, {top: 0}]}>
                {!shareCheck ?(
                    <TouchableOpacity
                        style={{
                            backgroundColor:'#05A3D9',
                            padding:5,
                            borderRadius:25,
                        }}
                        onPress={handleStream}
                    >
                        <Text style={{textAlign: 'center', fontWeight:'bold', fontSize:16, color:'#fff'}}>
                            Start Stream
                        </Text>
                    </TouchableOpacity>
                ): (
                    <View style={{flexDirection:'row', width:'100%'}}>
                        <TouchableOpacity
                            style={ {
                                backgroundColor:'red',
                                padding:5,
                                borderRadius:25,
                                flex:1,
                                borderWidth:1,
                            }}
                            onPress={handleStream}
                        >
                            <Text style={{textAlign: 'center', fontWeight:'bold', fontSize:16, color:'#fff'}}>
                                End Stream
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor:'yellow',
                                padding:5,
                                borderRadius:25,
                                flex:1,
                                borderWidth:1,
                            }}
                            onPress={()=>{
                                Alert.alert("Emergency Services Contacted")
                            }}
                        >
                            <Text style={{textAlign: 'center', fontWeight:'bold', fontSize:16, color:'#000'}}>
                                Emergency
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{height:'100%'}}>
                    <View style={{height:'43%',width:'100%', marginVertical:5}}>
                        <NodeCameraView
                            style={pageStyles.nodeCameraView}
                            ref={vb}
                            outputUrl = {"rtmps://global-live.mux.com:443/app/" + streamKey}
                            camera={{ cameraId: 1, cameraFrontMirror: true }}
                            audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
                            video={{ preset: 12, bitrate: 400000, profile: 1, fps: 15, videoFrontMirror: false }}
                            autopreview={true}
                            onStatus={(code, msg) => {
                                console.log("onStatus=" + code + " msg=" + msg);
                            }}
                        />
                    </View>
                    {!showChat ? (
                        <MapboxGL.MapView
                            style={pageStyles.map}
                        >
                            <MapboxGL.Camera
                                zoomLevel={16}
                                centerCoordinate={coordinates}
                            />
                            <MapboxGL.MarkerView
                                id={"marker"}
                                coordinate={coordinates}>
                                <View>
                                    <Image
                                        source={user.profilePicture? {uri: user.profilePicture}: img}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: "red",
                                            resizeMode: "cover",
                                            borderColor: "#05A3D9",
                                            borderWidth: 3,
                                        }}
                                    />
                                </View>
                            </MapboxGL.MarkerView>
                        </MapboxGL.MapView>
                    ): (
                        <View style={pageStyles.map}>
                            <GiftedChat
                                messages={messages}
                                onSend={(messages)=> onSend(messages)}
                                renderComposer={()=>(
                                    <View>

                                    </View>

                                )}
                                user={{
                                    _id: auth().currentUser.uid,
                                }}
                            />
                        </View>
                    )}

                    <View style={{flexDirection:'row', width:'100%', height:50, backgroundColor:'#05A3D9', borderRadius:10}}>
                        <TouchableOpacity style={{overflow:'hidden', borderRightWidth:1}}
                                          onPress={()=>{
                                              if (shareCheck){
                                                  setShowQR(!showQR);
                                              }else {
                                                  ToastAndroid.show('Please start stream first', ToastAndroid.SHORT);
                                              }
                                          }}
                        >
                            <Avatar.Icon
                                color={'#fff'}
                                size={50}
                                icon="qrcode" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{overflow:'hidden', borderRightWidth:1}}
                                          onPress={()=> setShowChat(!showChat)}
                        >
                            <Avatar.Icon
                                color={'#fff'}
                                size={50}
                                icon="chat" />
                        </TouchableOpacity>
                        <TextInput mode="outlined"
                                   ref={messageInput}
                                   style={{flexGrow:1, height:50, backgroundColor:'#fff'}}
                                   onChangeText={setMessage}
                                   placeholder="Message" />
                        <TouchableOpacity style={{overflow:'hidden', borderLeftWidth:1}}
                                          onPress={()=>{
                                              if (shareCheck){
                                                  database.ref('Streams/'+ liveId + '/messages').push({
                                                      message: message,
                                                      userId: user.id,
                                                      userName: user.name,
                                                      time: firebase.database.ServerValue.TIMESTAMP
                                                  });
                                              }else {
                                                  ToastAndroid.show('Please start the stream to chat', ToastAndroid.SHORT);
                                              }
                                              messageInput.current.clear();
                                              messageInput.current.blur();
                                          }}>
                            <Avatar.Icon
                                color={'#fff'}
                                size={50}
                                icon="send" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {showQR && (
                <View style={{
                    height:'100%',
                    backgroundColor:'#teal',
                    borderRadius:10,
                    position: 'absolute',
                    justifyContent:'center',
                    alignItems:'center',
                    width: '100%',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                }}>
                    <View style={{backgroundColor:'#05A3D9', height:300, width:300, justifyContent:'center', alignItems:'center', borderRadius:25, borderWidth:1}}>
                        <QRCode
                        style={{

                            backgroundColor: 'teal',
                        }}
                        value={liveId}
                        size={250}/>
                    </View>

                </View>
            )}
        </SafeAreaView>
    )
}
const pageStyles = StyleSheet.create({
    nodeCameraView: {
        height:'100%',
        backgroundColor:'red',
        borderRadius:10,
        borderWidth:1,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF"
    },
    map: {
        width: '100%',
        height: '43%',
        overflow:'hidden'
    },
    markerContainer: {
        alignItems: "center",
        width: 60,
        backgroundColor: "transparent",
        height: 70,
    },
    textContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    text: {
        textAlign: "center",
        paddingHorizontal: 5,
        flex: 1,
    },
    loginButton:{
        padding: 10,
        margin: 10,
        backgroundColor:'#05A3D9',
        height: 70
    },
    loginButtonText:{
        color:'#fff',
        fontSize:18,
        fontWeight:'bold'
    },
});

export default Share_Individual_Share_Live;
