/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Picker,
  TouchableOpacity,
  ScrollView,
  Alert,
  DeviceEventEmitter
} from "react-native";
import { RNSerialport, definitions, actions } from "react-native-serialport";
//type Props = {};
class UsbSerialManual extends Component {
  static navigationOptions = {
    title: "Manual",
  }
  constructor(props) {
    super(props);

    this.state = {
      servisStarted: false,
      connected: false,
      usbAttached: false,
      output: "",
      outputArray: [],
      baudRate: "9600",
      interface: "-1",
      selectedDevice: null,
      deviceList: [{ name: "...", placeholder: true }],
      sendText: "",
      returnedDataType: definitions.RETURNED_DATA_TYPES.HEXSTRING
    };

    this.startUsbListener = this.startUsbListener.bind(this);
    this.stopUsbListener = this.stopUsbListener.bind(this);
  }

  componentDidMount() {
    this.startUsbListener();
  }

  componentWillUnmount() {
    this.stopUsbListener();
  }

  startUsbListener() {
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STARTED,
      this.onServiceStarted,
      this
    );
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STOPPED,
      this.onServiceStopped,
      this
    );
    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_ATTACHED,
      this.onDeviceAttached,
      this
    );
    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_DETACHED,
      this.onDeviceDetached,
      this
    );
    DeviceEventEmitter.addListener(actions.ON_ERROR, this.onError, this);
    DeviceEventEmitter.addListener(
      actions.ON_CONNECTED,
      this.onConnected,
      this
    );
    DeviceEventEmitter.addListener(
      actions.ON_DISCONNECTED,
      this.onDisconnected,
      this
    );
    DeviceEventEmitter.addListener(actions.ON_READ_DATA, this.onReadData, this);
    RNSerialport.setReturnedDataType(this.state.returnedDataType);
    RNSerialport.setAutoConnect(false);
    RNSerialport.startUsbService();
  };

  stopUsbListener = async () => {
    DeviceEventEmitter.removeAllListeners();
    const isOpen = await RNSerialport.isOpen();
    if (isOpen) {
      Alert.alert("isOpen", isOpen);
      RNSerialport.disconnect();
    }
    RNSerialport.stopUsbService();
  };

  onServiceStarted(response) {
    this.setState({ servisStarted: true });
    if (response.deviceAttached) {
      this.onDeviceAttached();
    }
  }
  onServiceStopped() {
    this.setState({ servisStarted: false });
    Alert.alert("Serviço Parado");
  }
  onDeviceAttached() {
    this.setState({ usbAttached: true });
    this.fillDeviceList();
  }
  onDeviceDetached() {
    this.setState({ usbAttached: false });
    this.setState({ selectedDevice: null });
    this.setState({
      deviceList: [{ name: "...", placeholder: true }]
    });
  }
  onConnected() {
    this.setState({ connected: true });
  }
  onDisconnected() {
    this.setState({ connected: false });
  }
  onReadData(data) {
    if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
    ) {
      const payload = RNSerialport.intArrayToUtf16(data.payload);
      this.setState({ output: this.state.output + payload });
    } else if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
    ) {
      const payload = RNSerialport.hexToUtf16(data.payload);
      this.setState({ output: this.state.output + payload });
    }
  }

  onError(error) {
    console.error(error);
  }

  handleConvertButton() {
    let data = "";
    if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
    ) {
      data = RNSerialport.hexToUtf16(this.state.output);
    } else if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
    ) {
      data = RNSerialport.intArrayToUtf16(this.state.outputArray);
    } else {
      return;
    }
    this.setState({ output: data });
  }
  fillDeviceList() {
    RNSerialport.getDeviceList().then(response => {
      if (response.status) {
        this.setState({ deviceList: response.devices });
      } else {
        Alert.alert(
          "Erro getDeviceList()",
          response.errorCode + " " + response.errorMessage
        );
      }
    });
  }
  devicePickerItems() {
    return this.state.deviceList.map((device, index) =>
      !device.placeholder ? (
        <Picker.Item key={index} label={device.name} value={device} />
      ) : (
        <Picker.Item key={index} label={device.name} value={null} />
      )
    );
  }

  handleSendButton() {
    RNSerialport.writeString(this.state.sendText);
  }
  handleClearButton() {
    this.setState({ output: "" });
    this.setState({ outputArray: [] });
  }

  checkSupport() {
    if (
      this.state.selectedDevice.name === undefined ||
      this.state.selectedDevice === null
    )
      return;
    RNSerialport.isSupported(this.state.selectedDevice.name)
      .then(status => {
        alert(status ? "Suportado" : "Não Suportado");
      })
      .catch(error => {
        alert(JSON.stringify(error));
      });
  }

  handleConnectButton = async () => {
    const isOpen = await RNSerialport.isOpen();
    if (isOpen) {
      RNSerialport.disconnect();
    } else {
      if (!this.state.selectedDevice) {
        alert("Escolha um Dispositivo");
        return;
      }
      RNSerialport.setInterface(parseInt(this.state.interface, 10));
      RNSerialport.connectDevice(
        this.state.selectedDevice.name,
        parseInt(this.state.baudRate, 10)
      );
    }
  };

  buttonStyle = status => {
    return status
      ? styles.button
      : Object.assign({}, styles.button, { backgroundColor: "#C0C0C0" });
  };

  render() {
    return (
      <ScrollView style={styles.body}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.line}>
              <Text style={styles.title}>Conexão:</Text>
              <Text style={styles.value}>
                {this.state.connected ? "Conectado" : "Não Conectado"}
              </Text>
            </View>
          </View>
          <ScrollView style={styles.output} nestedScrollEnabled={true}>
            <Text style={styles.full}>
              {this.state.output === "" ? "" : this.state.output}
            </Text>
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              onChangeText={text => this.setState({ sendText: text })}
              value={this.state.sendText}
              placeholder={".."}
            />
          </View>
          <View style={styles.line2}>
            <TouchableOpacity
              style={this.buttonStyle(this.state.connected)}
              onPress={() => this.handleSendButton()}
              disabled={!this.state.connected}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.handleClearButton()}
            >
              <Text style={styles.buttonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.handleConvertButton()}
            >
              <Text style={styles.buttonText}>Converter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.line2}>
            <View style={styles.inputContainer}>
              <Text>Baud Rate</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={text => this.setState({ baudRate: text })}
                value={this.state.baudRate}
                placeholder={"Baud Rate"}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text>Interface</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={text => this.setState({ interface: text })}
                value={this.state.interface}
                placeholder={"Interface"}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text>Dispositivos</Text>
            <Picker
              enabled={
                this.state.deviceList.length > 0 &&
                !this.state.deviceList[0].placeholder
              }
              selectedValue={this.state.selectedDevice}
              onValueChange={(value, index) =>
                this.setState({ selectedDevice: value })
              }
            >
              {this.devicePickerItems()}
            </Picker>
          </View>
          <TouchableOpacity
            style={this.buttonStyle(this.state.selectedDevice)}
            disabled={!this.state.selectedDevice}
            onPress={() => this.handleConnectButton()}
          >
            <Text style={styles.buttonText}>
              {this.state.connected ? "Desconectar" : "Conectar"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.buttonStyle(this.state.selectedDevice)}
            disabled={!this.state.selectedDevice}
            onPress={() => {
              this.checkSupport();
            }}
          >
            <Text style={styles.buttonText}>Testar Suporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  full: {
    flex: 1
  },
  body: {
    flex: 1
  },
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 16,
    marginRight: 16
  },
  header: {
    display: "flex",
    justifyContent: "center"
    //alignItems: "center"
  },
  line: {
    display: "flex",
    flexDirection: "row"
  },
  line2: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    width: 100
  },
  value: {
    marginLeft: 20
  },
  output: {
    marginTop: 10,
    height: 300,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1
  },
  inputContainer: {
    marginTop: 10,
    borderBottomWidth: 2
  },
  textInput: {
    paddingLeft: 10,
    paddingRight: 10,
    height: 40
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingLeft: 15,
    paddingRight: 15,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#147efb",
    borderRadius: 3
  },
  buttonText: {
    color: "#FFFFFF"
  }
});

export default UsbSerialManual;