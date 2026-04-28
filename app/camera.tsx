import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CameraScreen() {
  const [texto, setTexto] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  async function tirarFoto() {
    if (!cameraRef.current) return;
    const foto = await cameraRef.current.takePictureAsync();
    setFotoUri(foto.uri);
  }

  async function salvar() {
    if (!fotoUri || !location) return;

    const novoSegredo = {
      id: Date.now().toString(),
      texto,
      fotoUri,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    const dados = await AsyncStorage.getItem('segredos');
    const lista = dados ? JSON.parse(dados) : [];

    lista.push(novoSegredo);

    await AsyncStorage.setItem('segredos', JSON.stringify(lista));

    setTexto('');
    setFotoUri(null);
  }

  if (!cameraPermission) return <View />;
  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text>Sem permissão da câmera</Text>
        <Pressable onPress={requestCameraPermission}>
          <Text>Permitir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Digite seu segredo"
        value={texto}
        onChangeText={setTexto}
        style={styles.input}
      />

      {!fotoUri ? (
        <CameraView ref={cameraRef} style={styles.camera} />
      ) : (
        <Image source={{ uri: fotoUri }} style={styles.camera} />
      )}

      <Pressable style={styles.botao} onPress={tirarFoto}>
        <Text style={styles.textoBotao}>TIRAR FOTO</Text>
      </Pressable>

      <Pressable style={styles.botao} onPress={salvar}>
        <Text style={styles.textoBotao}>SALVAR NO COFRE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10 },
  camera: { width: '100%', height: 300, marginBottom: 10 },
  botao: { backgroundColor: '#333', padding: 15, marginBottom: 10 },
  textoBotao: { color: '#fff', textAlign: 'center' }
});