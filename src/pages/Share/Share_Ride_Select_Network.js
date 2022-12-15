import * as React from 'react';
import styles from "../../styles/global";
import {SafeAreaView, ScrollView, Text, View, ToastAndroid, TouchableOpacity, Image, StyleSheet} from "react-native";
import {Avatar, Button, Card, Paragraph, TextInput} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import img from "../../assets/default-profile-picture.webp";

const Share_Ride_Select_Network = ({navigation, route}) =>{
    const link = route?.params?.link;
    const [search, setSearch] = React.useState('');
    const [contacts, setContacts] = React.useState([]);
    const [selectedContacts, setSelectedContacts] = React.useState([]);
    React.useEffect(()=>{
        async function fetchData(){
            await firestore().collection('Network')
                .doc(auth().currentUser.uid)
                .get()
                .then(async r => {
                    if (r.exists){
                        if (r.data().contacts !== undefined) {
                            let tempContacts = [];
                            for (let i = 0; i < r.data().contacts.length; i++) {
                                await firestore().collection('Users').doc(r.data().contacts[i]).get().then(r => {
                                    if (r.data() !== undefined) {
                                        let data = {
                                            name: r.data().name,
                                            email: r.data().email,
                                            phone: r.data().phoneNumber,
                                            image: r.data().profilePicture,
                                            id: r.id,
                                        };
                                        tempContacts.push(data);
                                    }
                                });
                            }
                            setContacts(tempContacts);
                        } else {
                            setContacts([])
                        }
                    }else {
                        setContacts([])
                    }

                });
        }
        fetchData().then(()=>{
            console.log("User Contacts Fetched");
        });
    }, []);
    return(
        <SafeAreaView style={styles.mainView}>
            <View style={styles.bodyView}>
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
                {selectedContacts.length > 0 && (
                    <View style={{
                        backgroundColor: '#05A3D9',
                        borderRadius: 10,
                        overflow:'hidden',
                        flexDirection:'row',
                        justifyContent:'space-between',

                    }}>
                        <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            overflow: 'hidden',
                            width: '80%',
                            padding: 10,
                        }}>
                            {selectedContacts.map((val, ind)=>(
                                    <TouchableOpacity key={ind}
                                                      style={{backgroundColor: '#fff', paddingVertical: 2, paddingHorizontal:4, margin: 2, borderRadius:10}}
                                                      onPress={()=>{
                                                          setSelectedContacts(selectedContacts.filter(r=>r.id !== val.id));
                                                          setContacts([...contacts, val]);
                                                      }}>
                                        <Text style={{
                                            color: '#000',
                                            fontSize: 14,
                                            fontWeight: '800',
                                            fontStyle:'normal',
                                            fontFamily:'Roboto',
                                        }}>
                                            {val.name}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                        <TouchableOpacity style={{width:'20%', backgroundColor:'black', justifyContent:'center', alignItems:'center'}}
                                          onPress={()=> {
                                              if (selectedContacts.length > 0) {
                                                  firestore().collection('Streams')
                                                      .doc(auth().currentUser.uid)
                                                      .update({
                                                          myStreams: firestore.FieldValue.arrayUnion({streamID: link, timestamp: firestore.Timestamp.now(), status: 'active'})
                                                      }).then(() => {
                                                      console.log('Stream added!');
                                                  }).catch(error => {
                                                      if (error.code === 'firestore/not-found') {
                                                          firestore().collection('Streams')
                                                              .doc(auth().currentUser.uid)
                                                              .set({
                                                                  myStreams: [{streamID: link, timestamp:firestore.Timestamp.now(), status: 'active'}]
                                                              }).then(() => {
                                                              console.log('Stream added!');
                                                          })
                                                      }
                                                  });
                                                  for (let contact of selectedContacts){
                                                      firestore().collection('Streams')
                                                          .doc(contact.id)
                                                          .update({
                                                              sharedStreams: firestore.FieldValue.arrayUnion({streamID: link, timestamp: firestore.Timestamp.now(), status: 'active'})
                                                          }).then(() => {
                                                          console.log('Stream added!');
                                                      }).catch(error => {
                                                          if (error.code === 'firestore/not-found') {
                                                              firestore().collection('Streams')
                                                                  .doc(contact.id)
                                                                  .set({
                                                                      sharedStreams: [{streamID: link, timestamp: firestore.Timestamp.now(), status: 'active'}]
                                                                  }).then(() => {
                                                                  console.log('Stream added!');
                                                              })
                                                          }
                                                      });
                                                  }
                                                  navigation.replace('Share Ride Live Stream', {
                                                      link: link,
                                                  });
                                              }else{
                                                  ToastAndroid.show('Please select at least one contact', ToastAndroid.LONG);
                                              }

                                          }}
                        >
                            <Avatar.Icon
                                color={'#fff'}
                                size={75}
                                style={{backgroundColor: 'black'}}
                                icon="share" />
                        </TouchableOpacity>
                    </View>
                )}
                <TextInput
                    label="Search Contacts"
                    placeholder={"Search Contacts"}
                    mode={'outlined'}
                    activeOutlineColor={'#05A3D9'}
                    value={search}
                    onChangeText={setSearch}
                />
                <SafeAreaView>
                    <ScrollView>
                        {contacts.map((val,ind) => {
                            if (val.name.toLowerCase().includes(search.toLowerCase())){
                                return(
                                    <TouchableOpacity key={ind} style={{
                                        flexDirection:'row',
                                        marginVertical: 10,
                                        borderRadius: 25,
                                        backgroundColor: '#05A3D9'
                                    }}>
                                        <View style={{flexDirection: 'row', flexGrow: 1, padding:10, width:'80%'}}>
                                            <Image source={val.image ? {uri: val.image}: img} style={{
                                                width: 50,
                                                height: 50,
                                                alignSelf: 'center',
                                                borderRadius: 100,
                                                marginRight: 10,
                                            }}/>
                                            <View>
                                                <Text style={{color:'#fff', fontSize: 18, fontWeight:'bold'}}>{val.name}</Text>
                                                <Text style={{color:'#fff', fontSize: 18, fontWeight:'bold'}}>{val.phone}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{backgroundColor: 'blue', borderRadius:25, width:'20%'}}
                                                          onPress={()=>{
                                                              setSelectedContacts([...selectedContacts, val]);
                                                              ToastAndroid.show('Contact Selected', ToastAndroid.SHORT);
                                                              setContacts(contacts.filter((val1,ind1)=>ind1!==ind));
                                                          }}
                                        >
                                            <Avatar.Icon
                                                color={'#fff'}
                                                size={75}
                                                style={{backgroundColor: 'blue'}}
                                                icon="plus" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )
                            }
                        })
                        }
                    </ScrollView>
                </SafeAreaView>
            </View>
        </SafeAreaView>
    )
}
export default Share_Ride_Select_Network;
