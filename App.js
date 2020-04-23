
// 1. import
import React, { useReducer, useState, useEffect } from 'react';
import { Button, Text, TextInput, View, TouchableOpacity, 
  StyleSheet, AsyncStorage } from 'react-native';
import { createAppContainer, useFocusEffect } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { BarCodeScanner } from 'expo-barcode-scanner';

// 2.declare
const saveUser = async us => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(us));
  } catch (error) {
    console.log("msg",error.message);
  }
};

const reducer = (state, action) => {
  let user;
  switch(action.type) {
    case 'id':
      user = {...state, id: action.payload };
      saveUser(user);
      return user;
    case 'name': 
      user = {...state, name: action.payload };
      saveUser(user);
      return user;
    case 'temp': 
      user = {...state, temp: action.payload };
      saveUser(user);
      return user;
    default: return state;
  }
}

const getUser = async () => {
  let user = {id:'?',name:'?',temp:0.0};
  try {
    let us = await AsyncStorage.getItem('user') || "{id:'?',name:'?',temp:0}";
    user = JSON.parse(us);
  } catch (error) {
    console.log(error.message);
  }
  return user;
}

const InputScreen = ({navigation}) => {
  const [state,dispatch] = useReducer(reducer, getUser());
  const {id,name,temp} = state;
  const sendTemp = async () => {
    let us = await getUser();
    console.log("SEND TEMP TO SERVER ID:"+ us.id+" TEMP:"+ us.temp);
  };
  return (
    <View style={styles.input}>
      <Text>===</Text>
      <Text>Citizen ID</Text>
      <TextInput style={styles.text} autoCapitalize="none" autoCorrect={false}
        value={id} onChangeText={ val => dispatch({type:'id', payload:val})} />
      <Text>Citizen Name</Text>
      <TextInput style={styles.text} autoCapitalize="none" autoCorrect={false}
        value={name} onChangeText={ val => dispatch({type:'name', payload:val})} />
      <Text>Body Temperature</Text>
      <TextInput style={styles.text} autoCapitalize="none" autoCorrect={false}
        value={temp} onChangeText={ val => dispatch({type:'temp', payload:val})} />
      <Button onPress={()=>sendTemp()} title="SEND TEMP"/>
    </View>
  );
}

const QRScanScreen = ({ navigation}) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  useEffect(() => { setScanned(false); });

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    let us = await getUser();
    let url = "https://ssjnonthaburi.moph.go.th/covidscan/index.php?module=consumer_scan&a851eb48ddeae74f465ae5719bba6933&fmod=token&SERVANTID=1330500022874&PHONEID=0879581794";
    fetch(url, { method: 'GET', }) .then((resp) => { return resp.text(); })
    .then((text) => {
      console.log("DATA OK: ");
      navigation.navigate('Input')
    })
    .catch((err) => {
      setScanned(false);
    });
  };
  if (hasPermission === null) { return <Text>ขอใช้กล้องเพื่อสแกนคิวอาร์โค้ด</Text>; }
  if (hasPermission === false) { return <Text>ไม่สามารถใช้กล้องเพื่อสแกนคิวอาร์โค้ด</Text>; }
  return (
    <View style={styles.qrscan}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const App = createBottomTabNavigator( {
    Input: { 
      screen: InputScreen,
      navigationOptions: { tabBarLabel: 'INPUT', }
    },
    QRScan: { 
      screen: QRScanScreen,
      navigationOptions: { tabBarLabel: 'SCAN', }
    }
  });

// 3.export
export default createAppContainer(App);

// 4.style
const styles = StyleSheet.create({
  input: {
  },
  qrscan: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  text: {
    margin: 15,
    borderColor: 'black',
    borderWidth: 1
  }
});

