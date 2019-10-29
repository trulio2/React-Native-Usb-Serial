import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Image
} from 'react-native';
import { 
    Text,
    Button
} from 'galio-framework';

class HomeScreen extends Component {
    render(){
        const {navigate} = this.props.navigation;
        return(
            <ScrollView>
                <View>
                    <Image
                    style={styles.stretch}
                    source={require('../assets/robot-prod.png')}
                    />

                    <Text style={styles.text}>Conexão</Text>
                    <View style={styles.container}>
                    <Button round size="small" 
                    onPress={() => navigate('UsbAuto')}
                    >Auto             
                    </Button>
                    </View>
                    <View style={styles.container}>
                    <Button round size="small" 
                    onPress={() => navigate('UsbManual')}
                    >Manual                
                    </Button>
                    </View>
                </View>
             </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    text:{
        fontSize: 20,
        alignSelf: 'center'

    },
    button: {
      color: "black"

    },
    stretch: {
        width: 50,
        height: 50,
        resizeMode: 'stretch',
        alignSelf: 'center'
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 5
    },
});

export default HomeScreen;