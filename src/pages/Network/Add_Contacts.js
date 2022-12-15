import * as React from 'react';
import styles from "../../styles/global";
import {SafeAreaView, ScrollView, Text, View, ToastAndroid, TouchableOpacity, Image} from "react-native";
import {Avatar, Button, TextInput} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import img from "../../assets/default-profile-picture.webp";

const Add_Contacts = () =>{
    const [search,setSearch] = React.useState("");
    const [contacts,setContacts] = React.useState([]);
    React.useEffect(()=>{
        async function fetchData(){
            let myContacts = [];
            let tempContacts = [];
            await firestore().collection('Network')
                .doc(auth().currentUser.uid)
                .get()
                .then(doc=>{
                    if (doc.exists){
                        if (doc.data().contacts !== undefined){
                            myContacts = doc.data().contacts;
                        }
                    }
            });
            await firestore().collection('Users')
                .get()
                .then(r => {
                    r.docs.forEach((val) =>{
                        if (val.data() !== undefined) {
                            if (!myContacts.includes(val.id) && val.id !== auth().currentUser.uid){
                                let data = {
                                    name: val.data().name,
                                    email: val.data().email,
                                    phone: val.data().phoneNumber,
                                    image: val.data().profilePicture,
                                    id: val.id,
                                };
                                tempContacts.push(data);
                            }
                        }
                    })
                });
            setContacts(tempContacts);
        }
        fetchData().then(() => console.log("Contacts Fetched"));
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
                <TextInput
                    label="Search Contacts"
                    placeholder={"Search Contacts"}
                    mode={'outlined'}
                    activeOutlineColor={'#05A3D9'}
                    value={search}
                    onChangeText={setSearch}
                />
                <ScrollView>
                        {contacts.map((val,ind) => {
                            if (val.name.toLowerCase().includes(search.toLowerCase())){
                                return(
                                    <View key={ind} style={{
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
                                            <View style={{alignItems: 'center'}}>
                                                <Text style={{color:'#fff', fontSize: 18, fontWeight:'bold'}}>{val.name}</Text>
                                                <Text style={{color:'#fff', fontSize: 18, fontWeight:'bold'}}>{val.phone}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{backgroundColor: 'green', borderRadius:25, width:'20%'}}
                                                          onPress={() => {
                                                              firestore().collection('Network')
                                                                  .doc(auth().currentUser.uid)
                                                                  .update({
                                                                      contacts: firestore.FieldValue.arrayUnion(val.id)
                                                                  }).then(() =>{
                                                                    ToastAndroid.show('Contact Added', ToastAndroid.SHORT);
                                                                    setContacts(contacts.filter((val1,ind1)=>ind1!==ind));
                                                                  }).catch(err => {
                                                                      if (err.code === 'firestore/not-found'){
                                                                          firestore().collection('Network')
                                                                              .doc(auth().currentUser.uid)
                                                                              .set({
                                                                                  contacts: [val.id]
                                                                              }).then(() =>{
                                                                                  ToastAndroid.show('Contact Added', ToastAndroid.SHORT);
                                                                                  setContacts(contacts.filter((val1,ind1)=>ind1!==ind));
                                                                              }).catch(err => {
                                                                                  ToastAndroid.show(err.message, ToastAndroid.SHORT);
                                                                              })
                                                                      }else{
                                                                          ToastAndroid.show(err.message, ToastAndroid.SHORT);
                                                                      }
                                                              });
                                                          }}
                                        >
                                            <Avatar.Icon
                                                color={'#fff'}
                                                size={75}
                                                style={{backgroundColor: 'green'}}
                                                icon="account-plus" />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                        })
                        }
                    </ScrollView>
            </ScrollView>
        </SafeAreaView>
    )
}
export default Add_Contacts;
