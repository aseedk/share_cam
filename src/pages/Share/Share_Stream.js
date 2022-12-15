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
    StyleSheet, ToastAndroid, Alert,
} from "react-native";
import {Avatar} from "react-native-paper";
import MapboxGL, {Logger} from "@react-native-mapbox-gl/maps";
import {NodePlayerView} from 'react-native-nodemediaclient';
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {firebase} from "@react-native-firebase/database";
import img from "../../assets/default-profile-picture.webp";
import RNSecureStore from "react-native-secure-store";
import {GiftedChat} from "react-native-gifted-chat";


MapboxGL.setAccessToken('pk.eyJ1IjoiYXNlZWRrIiwiYSI6ImNremF6MTN4YTA4NTEydW50cmxnYmRodnIifQ.CZl7Mza55vy7J8tYdy4eyg');
Logger.setLogCallback(log => {
    const { message } = log;
    return !!(message.match('Request failed due to a permanent error: Canceled') ||
        message.match('Request failed due to a permanent error: Socket Closed'));

});

const database = firebase.app().database("https://sharecam-70d17-default-rtdb.europe-west1.firebasedatabase.app/");


const Share_Stream = ({navigation, route}) =>{
    const [coordinates, setCoordinates] = React.useState([0, 0]);
    const link = route?.params?.link;
    const [url, setUrl] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [messages, setMessages] = React.useState([]);
    const [showChat, setShowChat] = React.useState(false);
    const messageInput = React.useRef(null);
    const [user, setUser] = React.useState({});
    const [sender, setSender] = React.useState({});
    const vp = React.useRef(null);
    const onSend = React.useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, [])
    React.useEffect(() => {
        RNSecureStore.get('user').then(value => {
            if (value) {
                setUser(JSON.parse(value));
            }
        });
    }, []);
    React.useEffect(() =>{
        database.ref('Streams/' + link).on('value', (snapshot) => {
            if (snapshot.val()){
                setUrl("https://stream.mux.com/" + snapshot.val()?.playbacks?.id + ".m3u8");
                firestore().collection('Users')
                    .doc(snapshot.val()?.streamer)
                    .get()
                    .then(doc => {
                        if (doc.exists) {
                            setSender(doc.data());
                        }
                    });
                setCoordinates(snapshot.val()?.startCoordinates);
            }
        });
    }, [link])
    React.useEffect(() => {
        database
            .ref('Streams/' + link + "/messages")
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
                //setMessages(messages => [...messages, snapshot.val()]);
            });
        return () => {
            database.ref(link).off();
            setUrl('');
            setMessage('');
            setMessages([]);
        };
    }, [link]);
    React.useEffect(() => {
        database
            .ref('Streams/' + link + "/historyCoordinates")
            .on('child_added', snapshot => {
                setCoordinates(snapshot.val().coordinates);
            });
        return () => {
            database.ref(link).off();
            setCoordinates([0, 0]);
            setMessage('');
            setMessages([]);
            //vp.current.stop();
            setUrl('');
        };
    }, [link]);
    return(
        <SafeAreaView style={[styles.mainView]}>
            <View style={[styles.bodyView, {top: 0}]}>
                <View style={{flexDirection:'row', width:'100%'}}>
                    <TouchableOpacity
                        style={ {
                            backgroundColor:'red',
                            padding:5,
                            borderRadius:25,
                            flex:1,
                            borderWidth:1,
                        }}
                        onPress={()=> {
                            navigation.replace('Homepage');
                            vp.current.stop();
                            ToastAndroid.show('Thank you for watching. Stay Safe!', ToastAndroid.SHORT);
                        }}
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
                <View style={{height:'100%'}}>
                    <View style={{height:'43%',width:'100%', marginVertical:5}}>
                        <NodePlayerView
                            style={pageStyles.nodeCameraView}
                            ref={vp}
                            inputUrl={url}
                            scaleMode={"ScaleAspectFit"}
                            bufferTime={300}
                            maxBufferTime={1000}
                            autoplay={true}
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
                                        source={user.profilePicture? {uri: sender.profilePicture}: img}
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
                                              setShowChat(!showChat);
                                          }}
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
                                              database.ref('Streams/'+ link + '/messages').push({
                                                  message: message,
                                                  userId: user.id,
                                                  userName: user.name,
                                                  time: firebase.database.ServerValue.TIMESTAMP
                                              });
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

export default Share_Stream;
