import { useCallback, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
// TODO: Importar AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';

interface Segredo {
  id: string;
  texto: string;
  fotoUri: string | null;
  latitude: number;
  longitude: number;
}

export default function MapaScreen() {
  const [segredos, setSegredos] = useState<Segredo[]>([]);
  const [regiao, setRegiao] = useState<Region | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [segredoSelecionado, setSegredoSelecionado] = useState<Segredo | null>(null);

  // Carrega os dados toda vez que a tela é aberta
  useFocusEffect(
    useCallback(() => {
      carregarSegredos();

      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          setRegiao({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      })();
    }, [])
  );

  const carregarSegredos = async () => {
    // TODO 5: Ler a lista de segredos do AsyncStorage, fazer JSON.parse() e colocar no estado setSegredos.
    try {
      const dados = await AsyncStorage.getItem('segredos');
      const lista = dados ? JSON.parse(dados) : [];
      setSegredos(lista);
    } catch (e) { }
  };

  const abrirDetalhes = (segredo: Segredo) => {
    setSegredoSelecionado(segredo);
    setModalVisivel(true);
  };

  return (
    <View style={styles.container}>
      {/* TODO 6: O MapView precisa receber o initialRegion ou region */}
      <MapView
        style={styles.map}
        region={regiao || undefined}
        showsUserLocation={true}
      >

        {/* TODO 7: Fazer um map() no array de segredos para criar os Markers */}
        {segredos.map((segredo) => (
          <Marker
            key={segredo.id}
            coordinate={{ latitude: segredo.latitude, longitude: segredo.longitude }}
            onPress={() => abrirDetalhes(segredo)}
          />
        ))}

      </MapView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Segredo Encontrado</Text>
            
            <Text style={styles.modalTexto}>{segredoSelecionado?.texto}</Text>

            {/* Desafio Bônus: Mostrar a miniatura da foto aqui dentro! */}
            {segredoSelecionado?.fotoUri && (
              <Image
                key={segredoSelecionado.id}
                source={{ uri: segredoSelecionado.fotoUri }}
                style={styles.imagemModal}
                resizeMode="cover"
              />
            )}

            <TouchableOpacity 
              style={styles.btnFechar} 
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.btnFecharTexto}>Voltar ao Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {segredos.length === 0 && (
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoText}>Nenhum segredo salvo ainda. Vá na outra aba!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalTexto: {
    color: '#eee',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  imagemModal: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#333'
  },
  btnFechar: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25
  },
  btnFecharTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },

  avisoContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20
  },

  avisoText: { color: '#fff' }
});