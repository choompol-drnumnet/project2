
// 1. import
import React, { useReducer, useState, useEffect } from 'react';
import { Button, Text, TextInput, View, TouchableOpacity, 
  StyleSheet, AsyncStorage } from 'react-native';
import { createAppContainer } from 'react-navigation';
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
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    let us = await getUser();
    fetch('https://www.google.com', {
      method: 'GET',
    })
    .then((res) => console.log("GOT DATA "))
    .catch((err) => console.log(err));

    setScanned(false);
    navigation.navigate('Input')
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

