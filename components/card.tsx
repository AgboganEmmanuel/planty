import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export default function Card() {
  
  return (
    <View style={{ 
      flexDirection: 'column', 
      justifyContent: 'flex-start', 
      height: 500, 
      paddingHorizontal: 20,
      backgroundColor: 'rgb(214 245 214)',
      borderTopLeftRadius: 60,
      borderTopRightRadius: 60
    }}>
      <Text
      style={{ 
        color: 'rgb(5 15 6)',
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginTop: 50
      }}>My Plants:</Text>
    </View>
  );
}