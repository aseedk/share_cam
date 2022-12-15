import * as React from 'react';
import styles from "../../styles/global";
import {SafeAreaView, ScrollView, Text, View, ToastAndroid, TouchableOpacity, Image} from "react-native";
import {Avatar, Button, TextInput} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import img from "../../assets/default-profile-picture.webp";

const Network_Homepage = ({navigation}) =>{
    const [search, setSearch] = React.useState('');
    const [contacts, setContacts] = React.useState([]);
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
                <Button mode="contained"
                        style={{
                            marginVertical: 10
                        }}
                        onPress={() => navigation.navigate('Network Add Contact')}>
                    <Text>
                        Add Contacts
                    </Text>
                </Button>
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
                                            <View>
                                                <Text style={{color:'#fff', fontSize: 18, fontWeight:'bold'}}>{val.name}</Text>
                                                <Text style={{color:'#fff', fontSize: 18, fontWeight:'bold'}}>{val.phone}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{backgroundColor: 'red', borderRadius:25, width:'20%'}}
                                                          onPress={()=>{
                                                              firestore()
                                                                  .collection('Users')
                                                                  .doc(auth().currentUser.uid)
                                                                  .update({contacts: firestore.FieldValue.arrayRemove(val.id)})
                                                                  .then(()=>{
                                                                      ToastAndroid.show('Contact Deleted', ToastAndroid.SHORT);
                                                                      setContacts(contacts.filter((val1,ind1)=>ind1!==ind));
                                                                  });
                                                          }}
                                        >
                                            <Avatar.Icon
                                                color={'#fff'}
                                                size={75}
                                                style={{backgroundColor: 'red'}}
                                                icon="account-remove" />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                        })
                        }
                    </ScrollView>
                </SafeAreaView>
            </ScrollView>
        </SafeAreaView>
    )
}
export default Network_Homepage;
