import React, { Component } from 'react';
import { 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    View, 
    ScrollView,
    Image,
    Button
} from 'react-native';

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
                    <Button
                        title="Auto"
                        onPress={() => navigate('UsbAuto')}
                    />
                    </View>
                    <View style={styles.container}>
                    <Button
                        title="Manual"
                        onPress={() => navigate('UsbManual')}
                    />
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